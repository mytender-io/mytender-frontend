import React from "react";
import IconProps from ".";

const RedoIcon: React.FC<IconProps> = ({
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
        d="M15.3455 14.3877H6.08367C4.64371 14.3877 3.26273 13.8157 2.24452 12.7975C1.22632 11.7793 0.654297 10.3983 0.654297 8.95832C0.654297 7.51836 1.22632 6.13738 2.24452 5.11917C3.26273 4.10097 4.64371 3.52895 6.08367 3.52895H15.3455"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.4297 1.61232L15.3459 3.52857L13.4297 5.44482"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RedoIcon;
