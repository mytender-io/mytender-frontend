import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CircleHelp } from "lucide-react";

const QuestionTypeDropdown = ({
  value,
  onChange,
  showIcon = false
}: {
  value: string;
  onChange: (value: string) => void;
  showIcon?: boolean;
}) => {
  return (
    <Select value={value || "3b"} onValueChange={onChange}>
      <SelectTrigger className="w-32 bg-white text-sm">
        <div className="flex items-center gap-1">
          {showIcon && <CircleHelp className="size-4 stroke-[1.5]" />}
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="3b" className="my-2">
          <span className="font-medium">General</span>
        </SelectItem>
        <SelectItem value="3b_case_study" className="my-2">
          <span className="font-medium">Case Study</span>
        </SelectItem>
        <SelectItem value="3b_commercial" className="my-2">
          <span className="font-medium">Compliance</span>
        </SelectItem>
        <SelectItem value="3b_personnel" className="my-2">
          <span className="font-medium">Team</span>
        </SelectItem>
        <SelectItem value="3b_technical" className="my-2">
          <span className="font-medium">Technical</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default QuestionTypeDropdown;
