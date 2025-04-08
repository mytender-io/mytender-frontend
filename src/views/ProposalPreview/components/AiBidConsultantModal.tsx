import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Props {
  setCriterias: (
    value: React.SetStateAction<
      {
        key: string;
        question: string;
        requirements: string;
      }[]
    >
  ) => void;
}

export const AiBidConsultantModal = ({ setCriterias }: Props) => {
  const [question, setQuestion] = useState("");
  const [requirements, setRequirements] = useState("");
  const [opened, setOpened] = useState(false);

  const onSave = () => {
    const criteria = {
      key: question
        .split(" ")
        .map((el) => el.toLowerCase)
        .join("_"),
      question,
      requirements
    };

    setCriterias((prev) => [...prev, criteria]);
    setOpened(false);
  };

  return (
    <Dialog open={opened}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-orange border-orange mt-4 hover:bg-orange-100 hover:text-orange-600"
          onClick={() => setOpened(true)}
        >
          Add Criteria
        </Button>
      </DialogTrigger>
      <DialogContent showClose={false} className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-3">
            Paste in the Evaluation Criteria
          </DialogTitle>
          <DialogDescription className="font-medium">
            This will help make the feedback tailored to the response
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 p-4 bg-white rounded border">
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="email">Question:</Label>
            <Input
              id="question"
              placeholder="What is your mobilisation plan?"
              className="w-full"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="email">Tender Requirements:</Label>
            <Textarea
              id="question"
              placeholder="Please type in the tender criteria"
              className="w-full"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => setOpened(false)}
            type="button"
            variant="ghost"
            className="text-sm text-gray-600 py-4"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="text-sm py-4 text-white bg-orange hover:bg-orange-light"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

