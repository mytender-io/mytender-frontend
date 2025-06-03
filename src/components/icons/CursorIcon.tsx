import React from "react";
import IconProps from ".";

const CursorIcon: React.FC<IconProps> = ({
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
        d="M11.5127 5.12451V10.8733"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.95801 2.5708C9.63564 2.5708 10.2855 2.83999 10.7647 3.31914C11.2438 3.7983 11.513 4.44817 11.513 5.1258C11.513 4.44817 11.7822 3.7983 12.2613 3.31914C12.7405 2.83999 13.3904 2.5708 14.068 2.5708"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.95801 13.4295C9.63564 13.4295 10.2855 13.1603 10.7647 12.6812C11.2438 12.202 11.513 11.5521 11.513 10.8745C11.513 11.5521 11.7822 12.202 12.2613 12.6812C12.7405 13.1603 13.3904 13.4295 14.068 13.4295"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.29305 5.12451H14.7068C14.7068 5.12451 15.3455 5.12451 15.3455 5.76326V10.2345C15.3455 10.2345 15.3455 10.8733 14.7068 10.8733H1.29305C1.29305 10.8733 0.654297 10.8733 0.654297 10.2345V5.76326C0.654297 5.76326 0.654297 5.12451 1.29305 5.12451Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CursorIcon;
