import React from "react";
import IconProps from ".";

const LogoutIcon: React.FC<IconProps> = ({
  className,
  width = 24,
  height = 24
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      id="Door-Open-House-Exit-Logout--Streamline-Sharp"
      height={height}
      width={width}
      className={className}
    >
      <g id="door-open-house-exit-logout--door-open-house-exit-logout-emergency-escape-way-out-leave">
        <path
          id="Rectangle 177466"
          stroke="currentColor"
          d="M7 4V1h15v18l-9.5 3.5V19H7v-"
          strokeWidth="1"
        ></path>
        <path
          id="Rectangle 177467"
          stroke="currentColor"
          d="m22 1 -9.5 3.5v18"
          strokeWidth="1"
        ></path>
        <path
          id="Vector 2860"
          stroke="currentColor"
          d="M9.99992 10.042H2.00391"
          strokeWidth="1"
        ></path>
        <path
          id="Vector 2249"
          stroke="currentColor"
          d="m6 14.042 -4 -4 4 -4.00001"
          strokeWidth="1"
        ></path>
      </g>
    </svg>
  );
};

export default LogoutIcon;
