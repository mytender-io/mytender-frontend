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

  // Parse the folder path
  const parts = activeFolder.split("FORWARDSLASH");
 
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-sm text-orange font-semibold hover:text-orange-hover transition-colors ease-in-out cursor-pointer"
        onClick={() => setActiveFolder(null)}
      >
        {rootFolderName}
      </span>
     
      {parts.map((part: string, index: number) => {
        // Calculate the path for this breadcrumb piece
        const currentPath = parts.slice(0, index + 1).join("FORWARDSLASH");
       
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
                  setActiveFolder(currentPath);
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