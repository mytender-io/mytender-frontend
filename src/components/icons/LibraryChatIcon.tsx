import React from "react";
import IconProps from ".";

const LibraryChatIcon: React.FC<IconProps> = ({
  className,
  width = 24,
  height = 24,
  strokeWidth = 1
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      id="Reward-Stars-3--Streamline-Ultimate"
      height={height}
      width={width}
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.625 13.7238c-4.9877 1.6808 -6.63196 3.5523 -7.8478 8.2136 -1.21584 -4.6613 -2.86007 -6.5328 -7.847794 -8.2136C5.91713 12.0431 7.56136 10.1716 8.7772 5.51025c1.21584 4.66135 2.8601 6.53285 7.8478 8.21355Z"
        strokeWidth={strokeWidth}
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22.8125 5.94817c-2.8135 0.94428 -3.7409 1.99579 -4.4268 4.61463 -0.6858 -2.61884 -1.6133 -3.67035 -4.4267 -4.61463 2.8134 -0.94428 3.7409 -1.99579 4.4267 -4.61467 0.6859 2.61888 1.6133 3.67039 4.4268 4.61467Z"
        strokeWidth={strokeWidth}
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M23.1782 19.5622c-2.0824 0.6842 -2.7689 1.4462 -3.2766 3.3439 -0.5076 -1.8977 -1.1941 -2.6597 -3.2766 -3.3439 2.0825 -0.6843 2.769 -1.4462 3.2766 -3.3439 0.5077 1.8977 1.1942 2.6596 3.2766 3.3439Z"
        strokeWidth={strokeWidth}
      ></path>
    </svg>
  );
};

export default LibraryChatIcon;
