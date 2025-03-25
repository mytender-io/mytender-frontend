import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

const CustomDateInput = ({
  value,
  onChange,
  disabled = false,
  defaultValue = new Date().toISOString().split("T")[0] // Default to current date
}) => {
  const dateInputRef = useRef(null);
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    // Handle both value prop and defaultValue
    const dateToUse = value || defaultValue;
    if (dateToUse) {
      const date = new Date(dateToUse);
      if (!isNaN(date.getTime())) {
        setDisplayValue(formatDate(date));
      }
    }
  }, [value, defaultValue]);

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleIconClick = (e) => {
    e.preventDefault();
    dateInputRef.current.showPicker();
  };

  const handleDateChange = (e) => {
    const newValue = e.target.value;
    const date = new Date(newValue);
    if (!isNaN(date.getTime())) {
      setDisplayValue(formatDate(date));
      onChange(newValue);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        type="text"
        value={displayValue}
        onChange={(e) => {
          setDisplayValue(e.target.value);
          // Only update if the input matches the expected format (DD/MM/YYYY)
          const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
          if (dateRegex.test(e.target.value)) {
            const [day, month, year] = e.target.value.split("/");
            const date = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day) + 1
            );
            if (!isNaN(date.getTime())) {
              onChange(date.toISOString().split("T")[0]);
            }
          }
        }}
        disabled={disabled}
        className="pr-9"
        placeholder="DD/MM/YYYY"
      />
      <Input
        ref={dateInputRef}
        type="date"
        value={value || defaultValue || ""}
        onChange={handleDateChange}
        disabled={disabled}
        className="invisible fixed z-50 h-10"
      />
      <i
        className={`fas fa-calendar-alt absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${
          disabled
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-600 hover:text-gray-700"
        }`}
        onClick={handleIconClick}
      ></i>
    </div>
  );
};

export default CustomDateInput;
