import React from "react";
import IconProps from ".";

const SymbolEqualIcon: React.FC<IconProps> = ({
  className,
  width = 16,
  height = 16
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-0.5 -0.5 16 16"
      id="Symbol-Equal--Streamline-Ultimate"
      height={height}
      width={width}
      className={className}
    >
      <path
        d="m0.46875 4.888125 14.0625 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
      ></path>
      <path
        d="m0.46875 10.111875 14.0625 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
      ></path>
    </svg>
  );
};

export default SymbolEqualIcon;
