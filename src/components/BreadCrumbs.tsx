import React from "react";

const BreadCrumbs = ({
  activeFolder,
  setActiveFolder
}: {
  activeFolder: string;
  setActiveFolder: (folder: string | null) => void;
}) => {
  const formatDisplayName = (name: string) => {
    if (typeof name !== "string") return "";
    return name.replace(/_/g, " ");
  };

  if (!activeFolder) {
    return <span className="text-sm text-gray-600">Content Library</span>;
  }

  const parts = activeFolder.split("FORWARDSLASH");

  return (
    <>
      <span
        className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
        onClick={() => setActiveFolder(null)}
      >
        Content Library
      </span>
      {parts.map((part: string, index: number) => (
        <React.Fragment key={index}>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span
            className={`text-sm ${
              index === parts.length - 1
                ? "text-gray-600"
                : "text-gray-600 hover:text-gray-800 cursor-pointer"
            }`}
            onClick={() => {
              if (index < parts.length - 1) {
                setActiveFolder(parts.slice(0, index + 1).join("FORWARDSLASH"));
              }
            }}
          >
            {part === "default"
              ? "Whole Content Library"
              : formatDisplayName(part)}
          </span>
        </React.Fragment>
      ))}
    </>
  );
};

export default BreadCrumbs;
