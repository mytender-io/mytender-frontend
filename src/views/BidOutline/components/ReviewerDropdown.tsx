import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { UserCircle } from "lucide-react";

interface ReviewerDropdownProps {
  value: string;
  onChange: (value: string) => void;
  contributors: Record<string, string>;
}

const ReviewerDropdown: React.FC<ReviewerDropdownProps> = ({
  value,
  onChange,
  contributors
}) => {
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="w-40 text-sm">
        <SelectValue placeholder="Select Reviewer" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(contributors).length > 0 ? (
          Object.entries(contributors).map(([email, role], index) => (
            <SelectItem key={index} value={email}>
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                <span>
                  {email} ({role})
                </span>
              </div>
            </SelectItem>
          ))
        ) : (
          <SelectItem value="" disabled className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span>No Contributors Available</span>
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default ReviewerDropdown;
