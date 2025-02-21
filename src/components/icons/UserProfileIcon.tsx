import React from "react";
import IconProps from ".";

const UserProfileIcon: React.FC<IconProps> = ({
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
      <g clipPath="url(#clip0_4235_2172)">
        <path
          d="M7.96816 9.405C8.74418 9.405 9.37335 8.7759 9.37335 7.99988C9.37335 7.2238 8.74418 6.59473 7.96816 6.59473C7.19208 6.59473 6.56299 7.2238 6.56299 7.99988C6.56299 8.7759 7.19208 9.405 7.96816 9.405Z"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.09375 13.3021C5.09375 11.7052 6.37125 10.4277 7.96816 10.4277C9.56503 10.4277 10.8425 11.7052 10.8425 13.3021H5.09375Z"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.2696 15.2181H2.73021C1.64434 15.2181 0.813965 14.3877 0.813965 13.3018V6.59496C0.813965 5.50909 1.64434 4.67871 2.73021 4.67871H13.2696C14.3555 4.67871 15.1858 5.50909 15.1858 6.59496V13.3018C15.1858 14.3238 14.2916 15.2181 13.2696 15.2181Z"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.6665 2.69824H13.2697"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.6665 2.69824H13.2697"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.26318 0.782227H11.6727"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4235_2172">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default UserProfileIcon;
