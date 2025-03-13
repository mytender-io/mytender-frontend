import React from "react";
import IconProps from ".";

const RedoSparkIcon: React.FC<IconProps> = ({
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
      <g clipPath="url(#clip0_4513_1701)">
        <path
          d="M4.32861 7.999C6.15875 7.63108 7.63226 6.13968 8.00069 4.26221C8.36919 6.13968 9.84233 7.63108 11.6725 7.999M11.6725 8.0011C9.84233 8.36902 8.36887 9.86044 8.00037 11.7379C7.63188 9.86044 6.15875 8.36902 4.32861 8.0011"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.7491 6.78376C15.1317 8.9182 14.4983 11.1991 12.8487 12.8487C10.1708 15.5266 5.82897 15.5266 3.15103 12.8487C0.473093 10.1708 0.473093 5.82897 3.15103 3.15103C5.82897 0.473094 10.1708 0.473094 12.8487 3.15103L13.4147 3.717"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
        />
        <path
          d="M10.9917 3.79089H13.4442V1.33838"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4513_1701">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default RedoSparkIcon;
