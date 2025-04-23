import React from "react";
import IconProps from ".";

const FeedbackIcon: React.FC<IconProps> = ({
  className,
  width = 9,
  height = 9
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 9 9"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_feedback_icon)">
        <path
          d="M7.9 1.1H1.1C0.77 1.1 0.5 1.37 0.5 1.7V6.1C0.5 6.43 0.77 6.7 1.1 6.7H2.3V8.5L4.1 6.7H7.9C8.23 6.7 8.5 6.43 8.5 6.1V1.7C8.5 1.37 8.23 1.1 7.9 1.1Z"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 3.1H6.5"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 4.7H5.5"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_feedback_icon">
          <rect width="9" height="9" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default FeedbackIcon;