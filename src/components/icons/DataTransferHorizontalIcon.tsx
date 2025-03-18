import React from "react";
import IconProps from ".";

const DataTransferHorizontalIcon: React.FC<IconProps> = ({
  className,
  width = 15,
  height = 15
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 15 15"
      fill="none"
      className={className}
    >
      <path
        d="M0.613281 6.00293H8.99687"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.00293 8.99707H14.3865"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.00859 8.39805L0.613281 6.00273L3.00859 3.60742"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9912 11.3922L14.3865 8.99688L11.9912 6.60156"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DataTransferHorizontalIcon;
