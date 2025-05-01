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
import { Check, Plus, Trash, X } from "lucide-react";
import posthog from "posthog-js";
import { useContext, useEffect, useRef, useState } from "react";
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
  const [url, setUrl] = useState("");
  const [competitorsUrl, setCompetitorsUrl] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [inputVisible, setInputVisible] = useState(true);
  const [dialogOpened, setDialogOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const { sharedState } = useContext(BidContext);

  const { object_id, competitor_urls = [] } = sharedState;
  
  console.log("competitor urls");
  console.log(competitor_urls);

  const getAuth = useAuthUser();
  const auth = getAuth();

  // get the compitor urls from the shared state and set this to the local competitor url state
  useEffect(() => {
    if (competitor_urls && competitor_urls.length > 0) {
      setCompetitorsUrl(competitor_urls);
      setInputVisible(competitor_urls.length === 0);
    }
  }, []);

  // every time local state changes update the shared states
  useEffect(() => {
    setSharedState((prev) => ({
      ...prev,
      competitor_urls: competitorsUrl
    }));
  }, [competitorsUrl, setSharedState]);

  const handleAddUrlToSetAndHistory = (url: string) => {
    setCompetitorsUrl((prev) => [url, ...prev]);

    setInputVisible(false);
  };

  const handleAddUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const url = e.currentTarget.value.trim();
      if (url) {
        posthog.capture("added_competitor_url", { url });
        handleAddUrlToSetAndHistory(url);
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
    const updatedUrl = e.target.value.trim();
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
      const updatedUrl = (e.target as HTMLInputElement).value.trim();
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
            <Button onClick={() => setDialogOpened(true)}>
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
            <p>Add specific competitors you know to improve accuracy</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={dialogOpened}>
        <DialogContent showClose={false} className="sm:max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Add Competitors
            </DialogTitle>
            <DialogDescription className="font-medium">
              Paste in your competitors’ websites to analyse
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {competitorsUrl.map((url, i) =>
                editingIndex === i ? (
                  <Input
                    key={i}
                    defaultValue={url}
                    onBlur={(e) => handleSaveEditBlur(e, i)}
                    onKeyDown={(e) => handleSaveEditKeyDown(e, i)}
                    autoFocus
                    className="!shadow-none focus-visible:!ring-0"
                  />
                ) : (
                  <div
                    key={i}
                    className="flex w-full items-center justify-between"
                  >
                    <Button
                      variant="link"
                      className="flex gap-2 items-center text-orange text-left justify-start py-0 h-fit whitespace-pre-line break-all"
                      onClick={() => handleEditUrl(i)}
                    >
                      <Check />
                      {url}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={loading}
                      onClick={() => handleDeleteUrl(i)}
                      className="hover:bg-transparent border-0"
                    >
                      <Trash />
                    </Button>
                  </div>
                )
              )}
            </div>

            {inputVisible && (
              <div className="">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    placeholder="Type Competitor URL..."
                    onKeyDown={handleAddUrlKeyDown}
                    className="!shadow-none focus-visible:!ring-0 pr-14"
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    className="absolute top-1/2 -translate-y-1/2 right-0 text-sm py-4 hover:bg-transparent hover:text-orange-600 border-0 justify-start text-orange font-semibold"
                    onClick={() => handleAddUrlToSetAndHistory(url)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {competitorsUrl.length > 0 && (
              <Button
                variant="ghost"
                className="hover:bg-transparent border-0 justify-start text-[#575859] font-semibold"
                onClick={() => {
                  setInputVisible(true);
                  if (inputRef?.current) {
                    inputRef.current.focus();
                  }
                }}
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
