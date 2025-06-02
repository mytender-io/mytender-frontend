import React from "react";
import IconProps from ".";

const LightbulbIcon: React.FC<IconProps> = ({
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
      <g clipPath="url(#clip0_5672_3341)">
        <path
          d="M8.96703 15.3457H7.05078"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.60586 14.0684H6.41211"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.00879 0.654297V2.57055"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.58887 2.89941L3.94429 4.2542"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.429 2.89941L12.0742 4.2542"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0.663086 8.31934H2.57934"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.3547 8.31934H13.4385"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.8418 8.31914C11.8425 7.65998 11.6732 7.01177 11.3502 6.43715C11.0273 5.86253 10.5616 5.38092 9.99809 5.03886C9.43463 4.69679 8.79247 4.50584 8.13366 4.48444C7.47484 4.46305 6.82164 4.61193 6.23718 4.91672C5.65271 5.2215 5.15673 5.67188 4.79717 6.22434C4.4376 6.7768 4.22661 7.41265 4.18456 8.07047C4.14252 8.72829 4.27085 9.38584 4.55716 9.97958C4.84347 10.5733 5.27807 11.0832 5.81898 11.4599C5.90357 11.5187 5.97266 11.5971 6.02038 11.6884C6.06809 11.7798 6.09301 11.8813 6.09301 11.9843V12.471C6.09301 12.5557 6.12665 12.637 6.18655 12.6969C6.24644 12.7567 6.32768 12.7904 6.41238 12.7904H9.60613C9.69084 12.7904 9.77207 12.7567 9.83196 12.6969C9.89186 12.637 9.92551 12.5557 9.92551 12.471V11.9837C9.9255 11.8806 9.95042 11.7791 9.99813 11.6878C10.0459 11.5965 10.1149 11.5181 10.1995 11.4592C10.7066 11.1074 11.1208 10.638 11.4068 10.0912C11.6928 9.54429 11.842 8.93628 11.8418 8.31914Z"
          stroke="currentColor"
          strokeWidth="0.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_5672_3341">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default LightbulbIcon;
