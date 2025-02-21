import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const QuestionTypeDropdown = ({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <Select value={value || "3b"} onValueChange={onChange}>
      <SelectTrigger className="w-32 bg-white text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="3b">
          <span className="italic">General</span>
        </SelectItem>
        <SelectItem value="3b_case_study">
          <span className="italic">Case Study</span>
        </SelectItem>
        <SelectItem value="3b_commercial">
          <span className="italic">Compliance</span>
        </SelectItem>
        <SelectItem value="3b_personnel">
          <span className="italic">Team</span>
        </SelectItem>
        <SelectItem value="3b_technical">
          <span className="italic">Technical</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default QuestionTypeDropdown;
