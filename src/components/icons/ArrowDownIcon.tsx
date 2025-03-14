import React from "react";
import IconProps from ".";

const ArrowDownIcon: React.FC<IconProps> = ({
  className,
  width = 5,
  height = 3
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 5 3"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_4646_2443)">
        <path
          d="M0.116461 0.624813L2.14354 2.63356C2.18068 2.6703 2.23298 2.70067 2.29538 2.72175C2.35778 2.74283 2.42818 2.75391 2.49979 2.75391C2.57141 2.75391 2.64181 2.74283 2.70421 2.72175C2.76661 2.70067 2.8189 2.6703 2.85604 2.63356L4.88313 0.624813C4.91951 0.58701 4.93876 0.544151 4.93896 0.500498C4.93917 0.456846 4.92032 0.413922 4.88429 0.375998C4.84826 0.338073 4.79631 0.30647 4.73361 0.284332C4.6709 0.262194 4.59963 0.250293 4.52688 0.249813L0.472712 0.249813C0.399961 0.250293 0.328689 0.262194 0.265984 0.284332C0.203279 0.30647 0.151329 0.338073 0.1153 0.375998C0.0792718 0.413922 0.0604219 0.456846 0.0606256 0.500498C0.0608292 0.544151 0.0800796 0.58701 0.116461 0.624813Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_4646_2443">
          <rect
            width="5"
            height="3"
            fill="white"
            transform="matrix(-1 0 0 -1 5 3)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ArrowDownIcon;
