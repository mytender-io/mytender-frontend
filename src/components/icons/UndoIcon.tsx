import React from "react";
import IconProps from ".";

const UndoIcon: React.FC<IconProps> = ({
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
        d="M0.654453 14.3877H9.91633C11.3563 14.3877 12.7373 13.8157 13.7555 12.7975C14.7737 11.7793 15.3457 10.3983 15.3457 8.95832C15.3457 7.51836 14.7737 6.13738 13.7555 5.11917C12.7373 4.10097 11.3563 3.52895 9.91633 3.52895H0.654453"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.57031 1.61232L0.654062 3.52857L2.57031 5.44482"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UndoIcon;
