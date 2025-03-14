import React from "react";
import IconProps from ".";

const PencilIcon: React.FC<IconProps> = ({
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
      <g clipPath="url(#clip0_4577_1865)">
        <path
          d="M11.623 1.66748L14.333 4.37747L4.71975 13.9907L2.00977 11.2807L11.623 1.66748Z"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.00909 11.2808L0.654297 15.3458L4.7193 13.991L2.00909 11.2808Z"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.3326 4.37682L11.623 1.66724L12.0746 1.21565C12.4361 0.866588 12.9201 0.673441 13.4225 0.677807C13.925 0.682173 14.4056 0.883703 14.7609 1.23899C15.1162 1.59428 15.3177 2.0749 15.3221 2.57733C15.3264 3.07977 15.1333 3.56382 14.7842 3.92523L14.3326 4.37682Z"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4577_1865">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PencilIcon;
