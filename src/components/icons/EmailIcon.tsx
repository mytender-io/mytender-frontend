import React from "react";
import IconProps from ".";

const EmailIcon: React.FC<IconProps> = ({
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
      <path
        d="M0.654297 2.86035H15.3455V13.0804H0.654297V2.86035Z"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.9696 3.23242L8.00016 8.92879L1.03076 3.23242"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EmailIcon;
