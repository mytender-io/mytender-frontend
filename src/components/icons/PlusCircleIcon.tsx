import React from "react";
import IconProps from ".";

const PlusCircleIcon: React.FC<IconProps> = ({
  className,
  width = 11,
  height = 11
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 11 11"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_4646_2453)">
        <path
          d="M0.669434 5.49998C0.669434 6.78112 1.17836 8.00979 2.08427 8.91569C2.99017 9.8216 4.21884 10.3305 5.49998 10.3305C6.78112 10.3305 8.00979 9.8216 8.91569 8.91569C9.8216 8.00979 10.3305 6.78112 10.3305 5.49998C10.3305 4.21884 9.8216 2.99017 8.91569 2.08427C8.00979 1.17836 6.78112 0.669434 5.49998 0.669434C4.21884 0.669434 2.99017 1.17836 2.08427 2.08427C1.17836 2.99017 0.669434 4.21884 0.669434 5.49998Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 2.86523V8.13492"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.13492 5.5H2.86523"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4646_2453">
          <rect width="11" height="11" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PlusCircleIcon;
