import React from "react";
import IconProps from ".";

const LocationIcon: React.FC<IconProps> = ({
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
      <path
        d="M13.749 6.76246C13.749 10.74 9.19979 14.4651 8.19503 15.2387C8.13919 15.2817 8.07069 15.305 8.00021 15.305C7.92974 15.305 7.86124 15.2817 7.8054 15.2387C6.8 14.4645 2.25146 10.74 2.25146 6.76246C2.25146 3.41158 4.64869 0.694336 8.00021 0.694336C11.3517 0.694336 13.749 3.41158 13.749 6.76246Z"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.16748 6.44383C4.16748 7.46027 4.57126 8.43508 5.28999 9.15381C6.00873 9.87255 6.98354 10.2763 7.99998 10.2763C9.01642 10.2763 9.99123 9.87255 10.71 9.15381C11.4287 8.43508 11.8325 7.46027 11.8325 6.44383C11.8325 5.42739 11.4287 4.45257 10.71 3.73384C9.99123 3.01511 9.01642 2.61133 7.99998 2.61133C6.98354 2.61133 6.00873 3.01511 5.28999 3.73384C4.57126 4.45257 4.16748 5.42739 4.16748 6.44383Z"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.38574 5.16602H11.6138"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.51514 8.04004H11.4852"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.45788 10.2355C6.76791 9.09004 6.40332 7.77816 6.40332 6.44098C6.40332 5.10379 6.76791 3.79192 7.45788 2.64648"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.54248 10.2355C9.23244 9.09004 9.59704 7.77816 9.59704 6.44098C9.59704 5.10379 9.23244 3.79192 8.54248 2.64648"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LocationIcon;
