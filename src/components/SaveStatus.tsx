import React from "react";
import { Loader2, Check, X } from "lucide-react";

const SaveStatus = ({ isLoading, saveSuccess }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-orange">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (saveSuccess === true) {
    return (
      <div className="flex items-center justify-center text-green-500">
        <Check className="h-6 w-6" />
      </div>
    );
  }

  if (saveSuccess === false) {
    return (
      <div className="flex items-center justify-center text-red-500">
        <X className="h-5 w-5" />
      </div>
    );
  }

  return null;
};

export default SaveStatus;
