import React from "react";
import IconProps from ".";

const HyperlinkIcon: React.FC<IconProps> = ({
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
        d="M8.95801 9.27732C8.95801 9.61614 9.0926 9.94108 9.33218 10.1807C9.57176 10.4202 9.89669 10.5548 10.2355 10.5548H13.4293C13.9371 10.5535 14.4237 10.3512 14.7828 9.99208C15.1418 9.633 15.3442 9.14638 15.3455 8.63857V7.36107C15.344 6.85332 15.1416 6.36679 14.7826 6.00776C14.4235 5.64872 13.937 5.44634 13.4293 5.44482H10.2355C9.89669 5.44482 9.57176 5.57942 9.33218 5.81899C9.0926 6.05857 8.95801 6.38351 8.95801 6.72232"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.0418 9.27732C7.0418 9.61614 6.9072 9.94108 6.66763 10.1807C6.42805 10.4202 6.10311 10.5548 5.7643 10.5548H2.57055C2.06274 10.5535 1.57612 10.3512 1.21704 9.99208C0.857969 9.633 0.655646 9.14638 0.654297 8.63857V7.36107C0.655813 6.85332 0.85819 6.36679 1.21723 6.00776C1.57627 5.64872 2.06279 5.44634 2.57055 5.44482H5.7643C6.10311 5.44482 6.42805 5.57942 6.66763 5.81899C6.9072 6.05857 7.0418 6.38351 7.0418 6.72232"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.4873 7.99951H11.5136"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HyperlinkIcon;
