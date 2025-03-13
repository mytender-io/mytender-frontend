import React from "react";
import IconProps from ".";

const CommentIcon: React.FC<IconProps> = ({
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
      <g clipPath="url(#clip0_4577_1829)">
        <path
          d="M14.2277 12.3115H7.52084L3.68834 15.1858V12.3115H1.77209C1.26109 12.3115 0.813965 11.8643 0.813965 11.3533V1.77209C0.813965 1.26109 1.26109 0.813965 1.77209 0.813965H14.2277C14.7387 0.813965 15.1858 1.26109 15.1858 1.77209V11.3533C15.1858 11.8643 14.7387 12.3115 14.2277 12.3115Z"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.96826 4.26318V8.73442"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.2037 6.56299H5.73242"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4577_1829">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CommentIcon;
