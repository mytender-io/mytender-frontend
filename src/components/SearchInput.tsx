import React from "react";
import SearchIcon from "./icons/SearchIcon";
import { Input } from "./ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search tenders..."
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("SearchInput value changing to:", e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="relative flex items-center w-full px-4 py-2 max-w-96 border border-typo-grey-6 rounded-lg bg-white">
      <SearchIcon className="absolute left-4 h-6 w-6 text-typo-700 z-10" />
      <Input
        type="text"
        className="w-full pl-9 border-none outline-none focus-visible:ring-0 shadow-none text-base md:text-base py-0 h-6"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchInput;
