import React from "react";
import IconProps from ".";

const ToolSparkIcon: React.FC<IconProps> = ({
  className = "text-gray-hint_text",
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
        d="M7.271 4.66076C8.74798 4.36383 9.93714 3.16022 10.2345 1.64502C10.5319 3.16022 11.7208 4.36383 13.1978 4.66076M13.1978 4.66248C11.7208 4.9594 10.5316 6.16302 10.2342 7.67822C9.93688 6.16302 8.74798 4.9594 7.271 4.66248"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.64387 11.65L11.3544 10.085C11.9629 9.73373 12.6929 9.97613 13.0123 10.5293C13.3636 11.1378 13.1212 11.8677 12.568 12.1871L8.97238 14.263C8.25327 14.6782 7.46173 14.8402 6.65304 14.7171L4.65074 14.4078L3.52002 15.0718"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.933594 11.9799L4.48302 9.93818C5.09151 9.58687 5.79582 9.4015 6.4853 9.44596L8.09405 9.5497C8.75164 9.53884 9.21358 10.0835 9.22444 10.741C9.17142 11.2879 8.7694 11.7414 8.19906 11.7755L6.10725 11.7294"
        stroke="currentColor"
        strokeWidth="0.67"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ToolSparkIcon;
