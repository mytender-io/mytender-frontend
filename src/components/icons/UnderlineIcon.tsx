import React from "react";
import IconProps from ".";

const UnderlineIcon: React.FC<IconProps> = ({
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
      <g clipPath="url(#clip0_4513_1866)">
        <path
          d="M0.654297 15.3442H15.3455"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.20898 0.654297V7.99992C3.20898 9.27047 3.71371 10.489 4.61213 11.3874C5.51054 12.2858 6.72906 12.7905 7.99961 12.7905C9.27016 12.7905 10.4887 12.2858 11.3871 11.3874C12.2855 10.489 12.7902 9.27047 12.7902 7.99992V0.654297"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.29297 0.65332H5.12547"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.874 0.65332H14.7065"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4513_1866">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default UnderlineIcon;
