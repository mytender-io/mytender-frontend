import React from "react";
import IconProps from ".";

const LayoutTableIcon: React.FC<IconProps> = ({
  className,
  width = 24,
  height = 24
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      id="Layout-Thumbnail-7--Streamline-Nova"
      height={height}
      width={width}
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2 1c-0.55228 0 -1 0.44772 -1 1v8c0 0.5523 0.44772 1 1 1h20c0.5523 0 1 -0.4477 1 -1V2c0 -0.55228 -0.4477 -1 -1 -1H2Zm1 8V3h18v6H3Zm-1 4c-0.55228 0 -1 0.4477 -1 1v8c0 0.5523 0.44772 1 1 1h20c0.5523 0 1 -0.4477 1 -1v-8c0 -0.5523 -0.4477 -1 -1 -1H2Zm1 8v-6h18v6H3Z"
        clipRule="evenodd"
        strokeWidth="1"
      ></path>
    </svg>
  );
};

export default LayoutTableIcon;
