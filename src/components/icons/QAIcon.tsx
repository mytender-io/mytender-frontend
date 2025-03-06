import React from "react";
import IconProps from ".";

const QAIcon: React.FC<IconProps> = ({
  className,
  width = 24,
  height = 24,
  strokeWidth = 1
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      id="Common-File-Double-Horizontal--Streamline-Ultimate"
      height={height}
      width={width}
      className={className}
    >
      <path
        d="M19.5 3.793a1 1 0 0 0 -0.707 -0.293H5.5a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1 -1V7.207a1 1 0 0 0 -0.293 -0.707Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></path>
      <path
        d="M4.5 6.5h-2a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1 -1v-2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></path>
    </svg>
  );
};

export default QAIcon;
