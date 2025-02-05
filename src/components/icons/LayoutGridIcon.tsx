import React from "react";
import IconProps from ".";

const LayoutGridIcon: React.FC<IconProps> = ({
  className,
  width = 24,
  height = 24
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      id="Layout-Thumbnail-2--Streamline-Nova"
      height={height}
      width={width}
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2 1c-0.55228 0 -1 0.44772 -1 1v8c0 0.5523 0.44772 1 1 1h8c0.5523 0 1 -0.4477 1 -1V2c0 -0.55228 -0.4477 -1 -1 -1H2Zm1 8V3h6v6H3Zm11 -8c-0.5523 0 -1 0.44772 -1 1v8c0 0.5523 0.4477 1 1 1h8c0.5523 0 1 -0.4477 1 -1V2c0 -0.55228 -0.4477 -1 -1 -1h-8Zm1 8V3h6v6h-6ZM1 14c0 -0.5523 0.44772 -1 1 -1h8c0.5523 0 1 0.4477 1 1v8c0 0.5523 -0.4477 1 -1 1H2c-0.55228 0 -1 -0.4477 -1 -1v-8Zm2 1v6h6v-6H3Zm11 -2c-0.5523 0 -1 0.4477 -1 1v8c0 0.5523 0.4477 1 1 1h8c0.5523 0 1 -0.4477 1 -1v-8c0 -0.5523 -0.4477 -1 -1 -1h-8Zm1 8v-6h6v6h-6Z"
        clipRule="evenodd"
        strokeWidth="1"
      ></path>
    </svg>
  );
};

export default LayoutGridIcon;
