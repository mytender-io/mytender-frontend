import React from "react";
import IconProps from ".";

const SidebarCollapseIcon: React.FC<IconProps> = ({
  className,
  width = 16,
  height = 16
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="-0.5 -0.5 16 16"
      id="Sidebar-Collapes--Streamline-Ultimate"
      height={height}
      width={width}
      className={className}
    >
      <desc>Sidebar Collapes Streamline Icon: https://streamlinehq.com</desc>
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        d="M1.71875 0.46875h11.5625s1.25 0 1.25 1.25v11.5625s0 1.25 -1.25 1.25H1.71875s-1.25 0 -1.25 -1.25V1.71875s0 -1.25 1.25 -1.25"
        strokeWidth="1"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.78125 0.46875v14.0625"
        strokeWidth="1"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.72168125 10.277687499999999 2.7777562500000004 -2.77775 -2.7777562500000004 -2.77778125"
        strokeWidth="1"
      ></path>
    </svg>
  );
};

export default SidebarCollapseIcon;
