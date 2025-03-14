import React from "react";
import IconProps from ".";

const ShortenHorizontalIcon: React.FC<IconProps> = ({
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
        d="M7.96826 15.1861V11.0342"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.05176 12.9504L7.96801 11.0342L9.88426 12.9504"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.96826 0.813965V4.96584"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.05176 3.0498L7.96801 4.96605L9.88426 3.0498"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.547 7.96792C14.547 8.67055 13.9721 9.24542 13.2695 9.24542H2.73014C2.02751 9.24542 1.45264 8.67055 1.45264 7.96792C1.45264 7.2653 2.02751 6.69043 2.73014 6.69043H13.2695C13.9721 6.69043 14.547 7.2653 14.547 7.96792Z"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ShortenHorizontalIcon;
