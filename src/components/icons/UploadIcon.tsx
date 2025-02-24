import React from "react";
import IconProps from ".";

const UploadIcon: React.FC<IconProps> = ({
  className,
  width = 13,
  height = 13
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 13 13"
      fill="none"
      className={className}
      width={width}
      height={height}
    >
      <g clipPath="url(#clip0_3209_12315)">
        <path
          d="M2.36348 8.61124C1.74152 8.19048 1.33203 7.47394 1.33203 6.66074C1.33203 5.43925 2.25595 4.43584 3.43605 4.32538C3.67745 2.84137 4.95253 1.70923 6.48926 1.70923C8.02599 1.70923 9.30108 2.84137 9.54248 4.32538C10.7226 4.43584 11.6465 5.43925 11.6465 6.66074C11.6465 7.47394 11.237 8.19048 10.6151 8.61124M4.42637 8.48499L6.48926 6.40014M6.48926 6.40014L8.55216 8.48499M6.48926 6.40014V11.091"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_3209_12315">
          <rect
            width="12.3774"
            height="12.5091"
            fill="white"
            transform="translate(0.300781 0.145508)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default UploadIcon;
