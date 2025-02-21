import React from "react";
import IconProps from ".";

const HomeIcon: React.FC<IconProps> = ({
  className,
  width = 24,
  height = 24
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      id="House-Chimney-2--Streamline-Ultimate"
      height={height}
      width={width}
      className={className}
    >
      <path
        d="M3.5 13.5v9a1 1 0 0 0 1 1H9a0.5 0.5 0 0 0 0.5 -0.5v-4a2.5 2.5 0 0 1 5 0v4a0.5 0.5 0 0 0 0.5 0.5h4.5a1 1 0 0 0 1 -1V14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
      ></path>
      <path
        d="M0.5 13 12 1.5 23.5 13"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
      ></path>
      <path
        d="M16 2.5h3a0.5 0.5 0 0 1 0.5 0.5v3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
      ></path>
    </svg>
  );
};

export default HomeIcon;
