import React from "react";
import IconProps from ".";

const DollarIcon: React.FC<IconProps> = ({
  className,
  width = 24,
  height = 24
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      id="Dollar-Coin--Streamline-Sharp-Remix"
      height={height}
      width={width}
      className={className}
    >
      <g id="dollar-coin--accounting-billing-payment-cash-coin-currency-money-finance">
        <path
          id="Union"
          fill="currentColor"
          fillRule="evenodd"
          d="M2.5 12c0 -5.24671 4.25329 -9.5 9.5 -9.5 5.2467 0 9.5 4.25329 9.5 9.5 0 5.2467 -4.2533 9.5 -9.5 9.5 -5.24671 0 -9.5 -4.2533 -9.5 -9.5ZM12 0C5.37258 0 0 5.37258 0 12c0 6.6274 5.37258 12 12 12 6.6274 0 12 -5.3726 12 -12 0 -6.62742 -5.3726 -12 -12 -12Zm1.25 6.75V5h-2.5v1.75H10C8.75736 6.75 7.75 7.75736 7.75 9v1.2192c0 1.0325 0.70267 1.9324 1.7043 2.1828l4.2957 1.074v1.274h-3.5V14h-2.5v1c0 1.2426 1.00736 2.25 2.25 2.25h0.75V19h2.5v-1.75H14c1.2426 0 2.25 -1.0074 2.25 -2.25v-1.7192c0 -1.0325 -0.7027 -1.9324 -1.7043 -2.1828L10.25 10.024V9.25h3.5V10h2.5V9c0 -1.24264 -1.0074 -2.25 -2.25 -2.25h-0.75Z"
          clipRule="evenodd"
          strokeWidth="1"
        ></path>
      </g>
    </svg>
  );
};

export default DollarIcon;
