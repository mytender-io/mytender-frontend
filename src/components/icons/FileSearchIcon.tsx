import React from "react";
import IconProps from ".";

const FileSearchIcon: React.FC<IconProps> = ({
  className,
  width = 12,
  height = 12
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_4646_2347)">
        <path
          d="M6.23975 8.40942C6.23975 8.98485 6.46834 9.53672 6.87523 9.94361C7.28212 10.3505 7.83399 10.5791 8.40942 10.5791C8.98485 10.5791 9.53672 10.3505 9.94361 9.94361C10.3505 9.53672 10.5791 8.98485 10.5791 8.40942C10.5791 7.83399 10.3505 7.28212 9.94361 6.87523C9.53672 6.46834 8.98485 6.23975 8.40942 6.23975C7.83399 6.23975 7.28212 6.46834 6.87523 6.87523C6.46834 7.28212 6.23975 7.83399 6.23975 8.40942Z"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.5091 11.5091L9.95312 9.95312"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.76041 11.5092H0.969785C0.84273 11.5092 0.720878 11.4587 0.631037 11.3688C0.541195 11.279 0.490723 11.1572 0.490723 11.0301V0.969785C0.490723 0.84273 0.541195 0.720878 0.631037 0.631037C0.720878 0.541195 0.84273 0.490723 0.969785 0.490723H7.33796C7.46501 0.49075 7.58684 0.54124 7.67666 0.631088L9.45255 2.40697C9.54239 2.49679 9.59288 2.61863 9.59291 2.74567V4.80228"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4646_2347">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default FileSearchIcon;
