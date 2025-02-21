import React from "react";
import IconProps from ".";

const FastIcon: React.FC<IconProps> = ({
  className,
  width = 18,
  height = 18
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        d="M6.75 13.125H2.625M4.875 9H1.5M6.75 4.875H3M12.75 2.25L7.80267 9.17626C7.5837 9.48282 7.47421 9.6361 7.47895 9.7639C7.48308 9.87516 7.53643 9.97884 7.62457 10.0469C7.72581 10.125 7.91418 10.125 8.29091 10.125H12L11.25 15.75L16.1973 8.82374C16.4163 8.51718 16.5258 8.3639 16.521 8.2361C16.5169 8.12484 16.4636 8.02116 16.3754 7.95314C16.2742 7.875 16.0858 7.875 15.7091 7.875H12L12.75 2.25Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default FastIcon;
