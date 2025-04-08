import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const LengthUnitDropdown = ({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <Select value={value || "words"} onValueChange={onChange}>
      <SelectTrigger className="w-28 bg-transparent border-none shadow-none p-0 h-10 focus:ring-0 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="words">
          <span className="italic">Words</span>
        </SelectItem>
        <SelectItem value="characters">
          <span className="italic">Characters</span>
        </SelectItem>
        <SelectItem value="pages">
          <span className="italic">Pages</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LengthUnitDropdown;
