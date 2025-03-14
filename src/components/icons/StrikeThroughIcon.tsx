import React from "react";
import IconProps from ".";

const StrikeThroughIcon: React.FC<IconProps> = ({
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
      <g clipPath="url(#clip0_4513_1875)">
        <path
          d="M0.654297 8.95703H15.3455"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.2353 4.4868C10.2475 3.98787 10.1597 3.49154 9.97718 3.02705C9.79464 2.56256 9.521 2.13928 9.17238 1.78215C8.82376 1.42502 8.40721 1.14125 7.94725 0.947555C7.48729 0.753858 6.99323 0.654148 6.49415 0.654297C5.70409 0.655038 4.94076 0.940485 4.34407 1.45832C3.74738 1.97615 3.35729 2.69168 3.24531 3.47377C3.13333 4.25585 3.30695 5.05209 3.73436 5.71656C4.16177 6.38103 4.81433 6.86921 5.57244 7.09162L8.11275 7.83257C8.99928 8.08999 9.7631 8.65876 10.2638 9.43432C10.7645 10.2099 10.9685 11.1401 10.8382 12.054C10.7079 12.9679 10.2521 13.8041 9.55456 14.4088C8.85705 15.0135 7.96471 15.3461 7.04156 15.3455C5.85571 15.3455 4.71843 14.8745 3.87991 14.0359C3.04139 13.1974 2.57031 12.0601 2.57031 10.8743"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4513_1875">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default StrikeThroughIcon;
