import React from "react";
import IconProps from ".";

const SortUpIcon: React.FC<IconProps> = ({
  className,
  width = 16,
  height = 16
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 48 48"
      id="Tailless-Line-Arrow-Up-1--Streamline-Plump"
      height={height}
      width={width}
      className={className}
    >
      <g id="Solid/Arrows/Tailless Line arrow/tailless-line-arrow-up-1--arrow-up-keyboard">
        <path
          id="Union"
          fill="currentColor"
          fillRule="evenodd"
          d="M24.3429 23.6345c-0.1893 -0.1687 -0.4741 -0.1689 -0.6636 -0.0005 -1.407 1.2506 -7.1369 6.3491 -14.32983 12.8214 -1.10279 0.9923 -2.58726 1.5794 -3.91174 0.9112 -0.58643 -0.2959 -1.23935 -0.7305 -1.89222 -1.3688 -0.75995 -0.7431 -1.23754 -1.486 -1.53768 -2.1264 -0.53858 -1.1492 -0.11394 -2.4294 0.66823 -3.4288C8.12752 23.4771 15.9408 16.5998 20.4433 12.8655c2.0818 -1.7266 5.0546 -1.727 7.1365 -0.0006 4.5035 3.7346 12.3165 10.6132 17.7508 17.5799 0.7783 0.9977 1.2003 2.2742 0.6646 3.4205 -0.3 0.6418 -0.7782 1.3871 -1.5405 2.1324 -0.6525 0.6379 -1.3049 1.0725 -1.891 1.3684 -1.3249 0.6691 -2.8102 0.082 -3.9134 -0.911 -7.1894 -6.4712 -12.9037 -11.5692 -14.3074 -12.8206Z"
          clipRule="evenodd"
          strokeWidth="0.5"
        ></path>
      </g>
    </svg>
  );
};

export default SortUpIcon;
