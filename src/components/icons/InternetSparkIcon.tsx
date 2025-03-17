import React from "react";
import IconProps from ".";

const InternetSparkIcon: React.FC<IconProps> = ({
  className,
  width = 12,
  height = 12
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_4646_2342)">
        <path
          d="M6.85889 2.99227C7.96662 2.76958 8.85849 1.86686 9.08154 0.730469C9.30455 1.86686 10.1962 2.76958 11.304 2.99227M11.304 2.99356C10.1962 3.21625 9.30436 4.11897 9.08131 5.25536C8.85825 4.11897 7.96662 3.21625 6.85889 2.99356"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.51733 2.92513C5.31234 2.89436 5.10246 2.87842 4.88879 2.87842C2.57592 2.87842 0.696289 4.75106 0.696289 7.0709V7.07789C0.696289 9.39075 2.56894 11.2704 4.88879 11.2704C7.20167 11.2704 9.08127 9.39775 9.08127 7.07789C9.08127 6.92722 9.07336 6.77838 9.05798 6.63183"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.88868 2.87842C3.95235 2.87842 3.19141 4.75106 3.19141 7.0709V7.07789C3.19141 9.39075 3.94952 11.2704 4.88868 11.2704C5.825 11.2704 6.58595 9.39775 6.58595 7.07789C6.58595 6.62249 6.55672 6.18405 6.50269 5.77345"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0.696289 7.07617H9.08136"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4646_2342">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default InternetSparkIcon;
