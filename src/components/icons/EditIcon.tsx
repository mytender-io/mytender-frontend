import React from "react";

interface EditIconProps {
  className?: string;
}

const EditIcon: React.FC<EditIconProps> = ({ className = "" }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.1333 8.93333C13.7333 8.93333 13.4 9.26667 13.4 9.66667V13.4C13.4 13.8 13.0667 14.1333 12.6667 14.1333H2.6C2.2 14.1333 1.86667 13.8 1.86667 13.4V3.33333C1.86667 2.93333 2.2 2.6 2.6 2.6H6.33333C6.73333 2.6 7.06667 2.26667 7.06667 1.86667C7.06667 1.46667 6.73333 1.13333 6.33333 1.13333H2.6C1.4 1.13333 0.4 2.13333 0.4 3.33333V13.4C0.4 14.6 1.4 15.6 2.6 15.6H12.6667C13.8667 15.6 14.8667 14.6 14.8667 13.4V9.66667C14.8667 9.26667 14.5333 8.93333 14.1333 8.93333Z"
        fill="currentColor"
      />
      <path
        d="M6.13332 7.86667C6.06665 7.93333 6.06665 8 6.06665 8.06667V9.66667C6.06665 10.0667 6.39998 10.4 6.79998 10.4H8.39998C8.46665 10.4 8.53332 10.4 8.59998 10.3333L12.9333 6L10 3.06667L6.13332 7.86667Z"
        fill="currentColor"
      />
      <path
        d="M15.0667 3.93333C15.6 3.4 15.6 2.53333 15.0667 2L14 0.933333C13.4667 0.4 12.6 0.4 12.0667 0.933333L11 2L13.9333 4.93333L15.0667 3.93333Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default EditIcon;
