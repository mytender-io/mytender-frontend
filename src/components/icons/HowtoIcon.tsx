import React from "react";
import IconProps from ".";

const HowtoIcon: React.FC<IconProps> = ({
  className,
  width = 24,
  height = 24
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      id="Flag-Information--Streamline-Ultimate"
      height={height}
      width={width}
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M0.5 23.5V0.5"
        strokeWidth="1"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M0.5 19.5c1.94342 -0.6122 3.96309 -0.9488 6 -1 3 0 7.5 2 10.5 2 2.0042 -0.095 3.9796 -0.5151 5.849 -1.244 0.1913 -0.0712 0.3562 -0.1993 0.4725 -0.367 0.1164 -0.1676 0.1787 -0.3669 0.1785 -0.571V4.44c-0.0001 -0.15875 -0.0379 -0.31521 -0.1105 -0.45643 -0.0725 -0.14122 -0.1776 -0.26314 -0.3066 -0.35568 -0.129 -0.09254 -0.2781 -0.15304 -0.4351 -0.1765 -0.1571 -0.02345 -0.3174 -0.00919 -0.4678 0.04161 -1.6653 0.59756 -3.4121 0.93715 -5.18 1.007 -3 0 -7.5 -2 -10.5 -2 -2.03691 0.05122 -4.05658 0.38783 -6 1v16Z"
        strokeWidth="1"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.5 15.5v-5c0 -0.2652 -0.1054 -0.51957 -0.2929 -0.70711C12.0196 9.60536 11.7652 9.5 11.5 9.5h-1"
        strokeWidth="1"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 15.5h4"
        strokeWidth="1"
      ></path>
      <path
        stroke="currentColor"
        d="M12.5 7.5c-0.1381 0 -0.25 -0.11193 -0.25 -0.25s0.1119 -0.25 0.25 -0.25"
        strokeWidth="1"
      ></path>
      <path
        stroke="currentColor"
        d="M12.5 7.5c0.1381 0 0.25 -0.11193 0.25 -0.25S12.6381 7 12.5 7"
        strokeWidth="1"
      ></path>
    </svg>
  );
};

export default HowtoIcon;
