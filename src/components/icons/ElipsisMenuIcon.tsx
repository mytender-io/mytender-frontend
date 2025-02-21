import React from "react";
import IconProps from ".";

const ElipsisMenuIcon: React.FC<IconProps> = ({
  className,
  width = 14,
  height = 14
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
      id="Vertical-Menu--Streamline-Core"
      height={height}
      width={width}
      className={className}
    >
      <g id="vertical-menu--navigation-vertical-three-circle-button-menu-dots">
        <path
          id="Union"
          fill="currentColor"
          fillRule="evenodd"
          d="M9 2c0 1.10457 -0.89543 2 -2 2s-2 -0.89543 -2 -2c0 -1.104569 0.89543 -2 2 -2s2 0.895431 2 2Zm0 5c0 1.10457 -0.89543 2 -2 2s-2 -0.89543 -2 -2 0.89543 -2 2 -2 2 0.89543 2 2Zm-2 7c1.10457 0 2 -0.8954 2 -2s-0.89543 -2 -2 -2 -2 0.8954 -2 2 0.89543 2 2 2Z"
          clipRule="evenodd"
          strokeWidth="1"
        ></path>
      </g>
    </svg>
  );
};

export default ElipsisMenuIcon;
