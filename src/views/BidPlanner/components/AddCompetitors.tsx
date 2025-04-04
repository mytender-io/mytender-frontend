import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { BidContext, SharedState } from "@/views/BidWritingStateManagerView";
import axios from "axios";
import { Check, Plus, Trash } from "lucide-react";
import posthog from "posthog-js";
import { useContext, useState } from "react";
import { useAuthUser } from "react-auth-kit";
import { toast } from "react-toastify";

interface Props {
  setTabContent: (
    value: React.SetStateAction<{
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
    }>
  ) => void;
  setSharedState: (value: React.SetStateAction<SharedState>) => void;
}

const AddCompetitors = ({ setTabContent, setSharedState }: Props) => {
  const [competitorsUrl, setCompetitorsUrl] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [inputVisible, setInputVisible] = useState(true);
  const [dialogOpened, setDialogOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const { sharedState } = useContext(BidContext);

  const { object_id } = sharedState;

  const getAuth = useAuthUser();
  const auth = getAuth();

  const handleAddUrlBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    e.preventDefault();
    const url = e.target.value;

    if (url) {
      posthog.capture("added_competitor_url", {
        url
      });
      setCompetitorsUrl((prev) => [url, ...prev]);
      setInputVisible(false);
      e.target.value = "";
    }
  };

  const handleAddUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const url = e.currentTarget.value;

      if (url) {
        posthog.capture("added_competitor_url", {
          url
        });
        setCompetitorsUrl((prev) => [url, ...prev]);
        setInputVisible(false);
        e.currentTarget.value = "";
      }
    }
  };

  const handleSearch = async () => {
    if (!object_id) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("competitor_urls", JSON.stringify(competitorsUrl));
    formData.append("bid_id", object_id);

    try {
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/generate_differentiation_with_competitors`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const generatedContent = result?.data.analysis;

      setTabContent((prev) => ({ ...prev, 3: generatedContent }));
      setSharedState((prev) => ({
        ...prev,
        differentiation_opportunities: generatedContent
      }));
      toast.success("Generated successfully!");
      setDialogOpened(false);
    } catch (err) {
      toast.error(
        "Error happened while generating the summary, please try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditUrl = (index: number) => {
    setEditingIndex(index);
    setInputVisible(false);
  };

  const handleSaveEditBlur = (
    e: React.FocusEvent<HTMLInputElement, Element>,
    i: number
  ) => {
    const updatedUrl = e.target.value;
    setCompetitorsUrl((prev) => {
      const newList = [...prev];
      newList[i] = updatedUrl;
      return newList;
    });
    setEditingIndex(null);
  };

  const handleSaveEditKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    i: number
  ) => {
    if (e.key === "Enter") {
      const updatedUrl = (e.target as HTMLInputElement).value;
      setCompetitorsUrl((prev) => {
        const newList = [...prev];
        newList[i] = updatedUrl;
        return newList;
      });
      setEditingIndex(null);
    }
  };

  const handleDeleteUrl = (index: number) => {
    const urlsToSet = competitorsUrl.filter((_, i) => i !== index);
    setCompetitorsUrl(urlsToSet);

    if (!urlsToSet.length) {
      setInputVisible(true);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="" onClick={() => setDialogOpened(true)}>
              <Plus className="h-5 w-5 text-white" />
              Competitors URLs
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            align="center"
            sideOffset={5}
            className="flex flex-col items-center max-w-[200px] text-center"
          >
            <TooltipArrow className="text-primary" />
            <p>Add Specific competitors you know to improve accuracy</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={dialogOpened}>
        <DialogContent showClose={false} className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Add Competitors
            </DialogTitle>
            <DialogDescription className="font-medium">
              Paste in your competitors websites to the analyse
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {competitorsUrl.map((url, i) =>
              editingIndex === i ? (
                <Input
                  key={i}
                  defaultValue={url}
                  onBlur={(e) => handleSaveEditBlur(e, i)}
                  onKeyDown={(e) => handleSaveEditKeyDown(e, i)}
                  autoFocus
                  className="!border-0 !shadow-none focus-visible:!ring-0"
                />
              ) : (
                <div className="flex w-full justify-between">
                  <button
                    key={i}
                    type="button"
                    className="flex gap-2 items-center text-orange w-full text-left"
                    onClick={() => handleEditUrl(i)}
                  >
                    <Check />
                    {url}
                  </button>

                  <Button
                    disabled={loading}
                    onClick={() => handleDeleteUrl(i)}
                    variant="ghost"
                    className="hover:bg-transparent border-0"
                  >
                    <Trash />
                  </Button>
                </div>
              )
            )}

            {inputVisible && (
              <Input
                placeholder="Type Competitor URL..."
                onBlur={handleAddUrlBlur}
                onKeyDown={handleAddUrlKeyDown}
                className="!border-0 !shadow-none focus-visible:!ring-0"
              />
            )}

            {competitorsUrl.length > 0 && (
              <Button
                variant="ghost"
                className="hover:bg-transparent border-0 justify-start text-[#575859] font-semibold"
                onClick={() => setInputVisible(true)}
              >
                + Add Competitor
              </Button>
            )}
          </div>
          <DialogFooter className="!justify-between">
            <Button
              onClick={() => setDialogOpened(false)}
              type="button"
              variant="ghost"
              className="text-sm py-4 hover:bg-transparent border-0 justify-start text-[#575859] font-semibold"
            >
              Back
            </Button>
            <Button
              className="flex items-center gap-2 text-sm py-4 text-white bg-orange hover:bg-orange-light"
              onClick={handleSearch}
            >
              Search
              {loading && (
                <Spinner className="text-white !w-5 !h-5 !border-2" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCompetitors;

