import React from "react";
import IconProps from ".";

const BinIcon: React.FC<IconProps> = ({
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
      <g clipPath="url(#clip0_4991_2304)">
        <path
          d="M8.59316 2.00586L7.86978 8.87601C7.84917 9.07218 7.75668 9.25376 7.61014 9.38578C7.46359 9.5178 7.27337 9.59091 7.07613 9.59102H2.92426C2.72695 9.59101 2.53663 9.51795 2.39 9.38592C2.24338 9.25389 2.15083 9.07224 2.13021 8.87601L1.40723 2.00586"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0.40918 2.00586H9.59121"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.20312 2.00605V0.808398C3.20312 0.702519 3.24519 0.600976 3.32005 0.526108C3.39492 0.45124 3.49646 0.40918 3.60234 0.40918H6.39687C6.50275 0.40918 6.6043 0.45124 6.67916 0.526108C6.75403 0.600976 6.79609 0.702519 6.79609 0.808398V2.00605"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 3.80225V7.99404"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.79629 3.80225L6.59668 7.99404"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.20312 3.80225L3.40273 7.99404"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4991_2304">
          <rect width="10" height="10" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default BinIcon;
