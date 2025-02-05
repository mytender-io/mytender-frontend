import React from "react";
import IconProps from ".";

const WordpaneIcon: React.FC<IconProps> = ({
  className,
  width = 24,
  height = 24
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      id="Microsoft-Word-Logo--Streamline-Ultimate"
      height={height}
      width={width}
      className={className}
    >
      <g>
        <path
          d="M6.5 18v3a1 1 0 0 0 1 1h15a1 1 0 0 0 1 -1V3a1 1 0 0 0 -1 -1h-15a1 1 0 0 0 -1 1v3"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        ></path>
        <path
          d="m12.5 12 11 0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        ></path>
        <path
          d="m12.5 7 11 0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        ></path>
        <path
          d="m12.5 17 11 0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        ></path>
        <path
          d="M1.5 6h10s1 0 1 1v10s0 1 -1 1h-10s-1 0 -1 -1V7s0 -1 1 -1"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        ></path>
        <path
          d="m3 9 1.5 6 2 -6 2 6L10 9"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        ></path>
      </g>
    </svg>
  );
};

export default WordpaneIcon;
