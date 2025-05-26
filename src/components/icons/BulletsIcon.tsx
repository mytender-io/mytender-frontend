import React from "react";
import IconProps from ".";

const BulletsIcon: React.FC<IconProps> = ({
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
        d="M0.654297 3.20816C0.654297 3.54698 0.78889 3.87192 1.02847 4.11149C1.26805 4.35107 1.59298 4.48566 1.9318 4.48566C2.27061 4.48566 2.59555 4.35107 2.83513 4.11149C3.0747 3.87192 3.2093 3.54698 3.2093 3.20816C3.2093 2.86935 3.0747 2.54441 2.83513 2.30484C2.59555 2.06526 2.27061 1.93066 1.9318 1.93066C1.59298 1.93066 1.26805 2.06526 1.02847 2.30484C0.78889 2.54441 0.654297 2.86935 0.654297 3.20816Z"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.76465 3.20801H15.3459"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.654297 8.31803C0.654297 8.65684 0.78889 8.98178 1.02847 9.22136C1.26805 9.46093 1.59298 9.59553 1.9318 9.59553C2.27061 9.59553 2.59555 9.46093 2.83513 9.22136C3.0747 8.98178 3.2093 8.65684 3.2093 8.31803C3.2093 7.97921 3.0747 7.65428 2.83513 7.4147C2.59555 7.17512 2.27061 7.04053 1.9318 7.04053C1.59298 7.04053 1.26805 7.17512 1.02847 7.4147C0.78889 7.65428 0.654297 7.97921 0.654297 8.31803Z"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.76465 8.31787H15.3459"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.654297 13.4279C0.654297 13.7667 0.78889 14.0916 1.02847 14.3312C1.26805 14.5708 1.59298 14.7054 1.9318 14.7054C2.27061 14.7054 2.59555 14.5708 2.83513 14.3312C3.0747 14.0916 3.2093 13.7667 3.2093 13.4279C3.2093 13.0891 3.0747 12.7641 2.83513 12.5246C2.59555 12.285 2.27061 12.1504 1.9318 12.1504C1.59298 12.1504 1.26805 12.285 1.02847 12.5246C0.78889 12.7641 0.654297 13.0891 0.654297 13.4279Z"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.76465 13.4282H15.3459"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BulletsIcon;
