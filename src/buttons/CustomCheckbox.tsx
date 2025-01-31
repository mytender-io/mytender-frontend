import React from "react";

const CustomCheckbox = ({ checked, onChange, onClick }) => {
  const handleClick = (e) => {
    // Prevent any parent click handlers
    e.stopPropagation();
    
    // Call the provided onClick if it exists
    if (onClick) {
      onClick(e);
    }
    
    // Call onChange with the new value
    if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <div 
      className="inline-block w-6 h-6 cursor-pointer" 
      onClick={handleClick}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {}} // Empty onChange to avoid React warning
        className="sr-only"
      />
      <div
        className={`w-6 h-6 rounded border border-gray-300 flex items-center justify-center transition-colors ${
          checked ? 'bg-[#FF8019]' : 'bg-white'
        }`}
      >
        {checked && (
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default CustomCheckbox;