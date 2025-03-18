import React from "react";
import IconProps from ".";

const RefreshArrowIcon: React.FC<IconProps> = ({
  className,
  width = 15,
  height = 15
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 15 15"
      fill="none"
      className={className}
    >
      <path
        d="M14.0872 5.39941L12.2907 8.09412L10.1948 5.69883"
        stroke="currentColor"
        stroke-width="0.67"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.60195 12.8895C5.47681 12.8895 4.37692 12.5558 3.44139 11.9307C2.50586 11.3056 1.7767 10.4171 1.34613 9.37763C0.915551 8.33812 0.802892 7.1943 1.0224 6.09075C1.24191 4.98722 1.78371 3.97356 2.57932 3.17795C3.37492 2.38235 4.38858 1.84054 5.49211 1.62103C6.59566 1.40152 7.73949 1.51419 8.77899 1.94476C9.8185 2.37534 10.707 3.1045 11.3321 4.04003C11.9572 4.97555 12.2908 6.07544 12.2908 7.20059V8.09524"
        stroke="currentColor"
        stroke-width="0.67"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default RefreshArrowIcon;
