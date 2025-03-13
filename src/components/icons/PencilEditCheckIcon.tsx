import React from "react";
import IconProps from ".";

const PencilEditCheckIcon: React.FC<IconProps> = ({
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
      <g clipPath="url(#clip0_4522_2211)">
        <path
          d="M15.186 11.3535C15.186 13.4614 13.4614 15.186 11.3535 15.186C9.24562 15.186 7.521 13.4614 7.521 11.3535C7.521 9.24562 9.24562 7.521 11.3535 7.521"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.1859 8.479L11.6728 11.9921C11.4812 12.1838 11.1618 12.1838 10.9702 11.9921L9.88428 10.9063"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.21157 14.0355L0.813965 15.1858L1.96117 10.7761M5.21157 14.0355L1.96117 10.7761M5.21157 14.0355L5.78517 13.4603M1.96117 10.7761L11.2025 1.50919C12.0948 0.614454 13.5607 0.550544 14.5166 1.50919C15.4089 2.40392 15.4089 3.87381 14.5166 4.83246L13.4332 5.91893M10.9475 1.76481L14.2663 5.08352M11.5211 5.66336L9.2905 3.42652"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4522_2211">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PencilEditCheckIcon;
