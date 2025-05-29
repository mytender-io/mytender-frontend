import React from "react";
import IconProps from ".";

const SidebarExpandIcon: React.FC<IconProps> = ({
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
      <g clip-path="url(#clip0_5670_2985)">
        <path
          d="M13.9088 0.813965H2.09195C2.09195 0.813965 0.814453 0.813965 0.814453 2.09146V13.9083C0.814453 13.9083 0.814453 15.1858 2.09195 15.1858H13.9088C13.9088 15.1858 15.1863 15.1858 15.1863 13.9083V2.09146C15.1863 2.09146 15.1863 0.813965 13.9088 0.813965Z"
          stroke="black"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M4.64648 0.813965V15.1858"
          stroke="black"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.8398 10.8389L8.00098 8.00003L10.8398 5.16113"
          stroke="black"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_5670_2985">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default SidebarExpandIcon;
