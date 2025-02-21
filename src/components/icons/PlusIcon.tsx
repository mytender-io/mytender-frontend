import React from "react";
import IconProps from ".";

const PlusIcon: React.FC<IconProps> = ({
  className,
  width = 20,
  height = 20
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 10"
      id="Plus--Streamline-Micro"
      height={height}
      width={width}
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M0.5 5h9"
        strokeWidth="1"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 9.5 0 -9"
        strokeWidth="1"
      ></path>
    </svg>
  );
};

export default PlusIcon;
