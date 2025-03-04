import React from "react";

type BreadCrumbsProps = {
  activeFolder: string;
  setActiveFolder: (folder: string | null) => void;
  rootFolderName?: string;
};

const BreadCrumbs = ({
  activeFolder,
  setActiveFolder,
  rootFolderName = "Content Library"
}: BreadCrumbsProps) => {
  const formatDisplayName = (name: string) => {
    if (typeof name !== "string") return "";
    return name.replace(/_/g, " ");
  };

  if (!activeFolder) {
    return (
      <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
        {rootFolderName}
      </span>
    );
  }

  // Parse the folder path and filter out the "case_studies_collection" part
  const allParts = activeFolder.split("FORWARDSLASH");
  
  // Remove "case_studies_collection" from the breadcrumb path
  const parts = allParts.filter(part => part !== "case_studies_collection");
  
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-sm text-orange font-semibold hover:text-orange-hover transition-colors ease-in-out cursor-pointer"
        onClick={() => setActiveFolder(null)}
      >
        {rootFolderName}
      </span>
      
      {parts.map((part: string, index: number) => {
        // Calculate the actual path for this breadcrumb piece
        // We need to reconstruct the proper path with case_studies_collection included
        const pathIndex = allParts.indexOf(part);
        const actualPath = allParts.slice(0, pathIndex + 1).join("FORWARDSLASH");
        
        return (
          <React.Fragment key={index}>
            <span className="mx-2 text-gray-400">&gt;</span>
            <span
              className={`text-sm transition-colors ease-in-out ${
                index === parts.length - 1
                  ? "text-gray-600"
                  : "text-orange hover:text-orange-hover cursor-pointer"
              }`}
              onClick={() => {
                if (index < parts.length - 1) {
                  // Use the actual path when setting active folder
                  setActiveFolder(actualPath);
                }
              }}
            >
              {part === "default"
                ? `Whole ${rootFolderName}`
                : formatDisplayName(part)}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BreadCrumbs;