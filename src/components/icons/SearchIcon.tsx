import React from "react";
import IconProps from ".";

const SearchIcon: React.FC<IconProps> = ({
  className,
  width = 24,
  height = 24
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      id="Search--Streamline-Guidance-Free"
      height={height}
      width={width}
      className={className}
    >
      <path
        stroke="currentColor"
        d="M18.425 18.425 23.5 23.5m-12.5 -2C5.201 21.5 0.5 16.799 0.5 11S5.201 0.5 11 0.5 21.5 5.201 21.5 11 16.799 21.5 11 21.5Z"
        strokeWidth="1"
      ></path>
    </svg>
  );
};

export default SearchIcon;
