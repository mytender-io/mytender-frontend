import React from "react";
import IconProps from ".";

const UpscaleSparkIcon: React.FC<IconProps> = ({
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
      <g clipPath="url(#clip0_4577_1834)">
        <path
          d="M7.1822 13.0289C3.90836 13.0289 1.25439 10.375 1.25439 7.10113C1.25439 3.82731 3.90836 1.17334 7.1822 1.17334C10.456 1.17334 13.11 3.82731 13.11 7.10113C13.11 10.375 10.456 13.0289 7.1822 13.0289Z"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.2837 11.3657L14.7451 14.8264"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
        />
        <path
          d="M3.62207 7.0997C5.39654 6.74296 6.82522 5.29692 7.18248 3.47656C7.53973 5.29692 8.9681 6.74296 10.7425 7.0997M10.7425 7.10174C8.9681 7.45849 7.53941 8.90449 7.18216 10.7249C6.82484 8.90449 5.39654 7.45849 3.62207 7.10174"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4577_1834">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default UpscaleSparkIcon;
