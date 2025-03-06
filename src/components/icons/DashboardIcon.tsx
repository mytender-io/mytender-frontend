import React from "react";
import IconProps from ".";

const DashboardIcon: React.FC<IconProps> = ({
  className,
  width = 24,
  height = 24,
  strokeWidth = 1
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      id="Layout-Corners-Dashboard-1--Streamline-Ultimate"
      height={height}
      width={width}
      className={className}
    >
      <path
        d="M0.5 5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0 -9 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></path>
      <path
        d="M14.5 5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0 -9 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></path>
      <path
        d="M0.5 19a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0 -9 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></path>
      <path
        d="M14.5 19a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0 -9 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      ></path>
    </svg>
  );
};

export default DashboardIcon;
