import React from "react";
import IconProps from ".";

const CheckIcon: React.FC<IconProps> = ({
  className,
  width = 10,
  height = 10
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 10 10"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_4991_2311)">
        <path
          d="M9.59121 0.408691L3.0041 9.59072L0.40918 6.9958"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4991_2311">
          <rect width="10" height="10" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CheckIcon;
