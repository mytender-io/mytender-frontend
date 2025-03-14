import React from "react";
import IconProps from ".";

const BoldIcon: React.FC<IconProps> = ({
  className,
  width = 16,
  height = 16
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M4.71484 7.45268V1.43018H8.27359C9.93667 1.43018 11.2848 2.77836 11.2848 4.44143C11.2848 6.10449 9.93667 7.45268 8.27359 7.45268H4.71484ZM4.71484 7.45268V14.5702H8.82109C10.7865 14.5702 12.3798 12.9768 12.3798 11.0114C12.3798 9.04598 10.7865 7.45268 8.82109 7.45268H4.71484Z"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BoldIcon;
