import { useContext, useMemo, useState } from "react";
import { useAuthUser } from "react-auth-kit";
import { BidContext } from "../BidWritingStateManagerView";
import { Check, Pencil, X, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ToneOfVoiceLibrary from "./ToneOfVoiceLibrary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import Solution from "./Solution";
import SelectCaseStudy from "./SelectCaseStudy";
import { useUserData } from "@/context/UserDataContext";
import AIChatDialog from "./AIChatDialog";

const BidIntel = ({
  showViewOnlyMessage
}: {
  showViewOnlyMessage: () => void;
}) => {
  const getAuth = useAuthUser();
  const auth = useMemo(() => getAuth(), [getAuth]);

  const { sharedState, setSharedState } = useContext(BidContext);
  const { contributors } = sharedState;

  // State for inline editing
  const [editingState, setEditingState] = useState({
    type: "",
    index: -1,
    text: ""
  });

  // State for AI chat dialog
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Process the shared state data for display
  const items = {
    painPoints: sharedState.customer_pain_points || [],
    winThemes: sharedState.win_themes || [],
    factors: sharedState.differentiating_factors || []
  };

  const currentUserPermission = contributors[auth?.email] || "viewer";

  const canUserEdit =
    currentUserPermission === "admin" || currentUserPermission === "editor";

  const { userProfile, organizationUsers, isLoading } = useUserData();

  const handleEditStart = (text: string, type: string, index: number) => {
    if (!canUserEdit) {
      showViewOnlyMessage();
      return;
    }
    setEditingState({ type, index, text });
  };

  const handleDelete = (type: string, index: number) => {
    if (!canUserEdit) {
      showViewOnlyMessage();
      return;
    }

    const updatedState = { ...sharedState };

    switch (type) {
      case "painPoints":
        updatedState.customer_pain_points =
          updatedState.customer_pain_points.filter((_, i) => i !== index);
        break;
      case "winThemes":
        updatedState.win_themes = updatedState.win_themes.filter(
          (_, i) => i !== index
        );
        break;
      case "factors":
        updatedState.differentiating_factors =
          updatedState.differentiating_factors.filter((_, i) => i !== index);
        break;
    }

    setSharedState(updatedState);
    toast.success("Item deleted successfully");
  };

  const handleSaveEdit = () => {
    if (editingState.text.trim() === "") {
      toast.error("Please enter valid text");
      return;
    }

    const updatedState = { ...sharedState };

    switch (editingState.type) {
      case "painPoints":
        updatedState.customer_pain_points[editingState.index] =
          editingState.text;
        break;
      case "winThemes":
        updatedState.win_themes[editingState.index] = editingState.text;
        break;
      case "factors":
        updatedState.differentiating_factors[editingState.index] =
          editingState.text;
        break;
    }

    setSharedState(updatedState);
    setEditingState({ type: "", index: -1, text: "" });
    toast.success("Item updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingState({ type: "", index: -1, text: "" });
  };

  // Handle opening AI modal
  const handleOpenAIModal = () => {
    if (!canUserEdit) {
      showViewOnlyMessage();
      return;
    }
    setIsAIModalOpen(true);
  };

  // Handle applying AI suggestions
  const handleApplySuggestions = (
    painPointSuggestions: string[],
    winThemeSuggestions: string[]
  ) => {
    const updatedState = { ...sharedState };

    // Update pain points
    if (painPointSuggestions.length > 0) {
      const existingPoints = new Set(updatedState.customer_pain_points || []);
      painPointSuggestions.forEach((suggestion) => {
        if (!existingPoints.has(suggestion)) {
          if (!updatedState.customer_pain_points) {
            updatedState.customer_pain_points = [];
          }
          updatedState.customer_pain_points.push(suggestion);
        }
      });
    }

    // Update win themes
    if (winThemeSuggestions.length > 0) {
      const existingThemes = new Set(updatedState.win_themes || []);
      winThemeSuggestions.forEach((suggestion) => {
        if (!existingThemes.has(suggestion)) {
          if (!updatedState.win_themes) {
            updatedState.win_themes = [];
          }
          updatedState.win_themes.push(suggestion);
        }
      });
    }

    setSharedState(updatedState);
    toast.success(
      "Customer pain points and win themes updated with AI suggestions"
    );
  };

  const CardItem = ({
    text,
    index,
    type
  }: {
    text: string;
    index: number;
    type: string;
  }) => {
    const isEditing =
      editingState.type === type && editingState.index === index;

    return (
      <div>
        <div className="flex items-center justify-between border-b py-2 px-4 border-gray-200 last:border-b-0">
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <Input
                value={editingState.text}
                onChange={(e) =>
                  setEditingState((prev) => ({ ...prev, text: e.target.value }))
                }
                className="flex-1"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-green-100 hover:text-green-600 w-6 h-6"
                onClick={handleSaveEdit}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-red-100 hover:text-red-600 w-6 h-6"
                onClick={handleCancelEdit}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <span className="text-sm text-gray-hint_text">
                {index + 1}. {text}
              </span>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:bg-orange-100 hover:text-orange w-6 h-6"
                  onClick={() => handleEditStart(text, type, index)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:bg-red-100 hover:text-red-600 w-6 h-6"
                  onClick={() => handleDelete(type, index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      {/* <Button onClick={handleOpenAIModal} className="mx-auto mb-4">
        <Sparkles />
        AI Input Editing
      </Button> */}

      <div className="grid grid-cols-3 gap-6">
        {/* Customer Pain Points Card */}
        <div className="bg-white rounded-lg shadow w-full">
          <div className="flex justify-between items-center px-4 py-3 bg-gray-100 rounded-t-lg border-b w-full">
            <span className="font-medium text-gray-hint_text">
              Customer Pain Points
            </span>
          </div>
          <div className="h-64 overflow-y-auto space-y-2">
            {items.painPoints.length > 0 ? (
              items.painPoints.map((item, index) => (
                <CardItem
                  key={`pain-${index}`}
                  text={item}
                  index={index}
                  type="painPoints"
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Click on the Pain Points button in the Bid Planner page to
                generate pain points.
              </p>
            )}
          </div>
        </div>

        {/* Win Themes Card */}
        <div className="bg-white rounded-lg shadow w-full">
          <div className="flex justify-between items-center px-4 py-3 bg-gray-100 rounded-t-lg border-b w-full">
            <span className="font-medium text-gray-hint_text">Win themes</span>
          </div>
          <div className="h-64 overflow-y-auto space-y-2">
            {items.winThemes.length > 0 ? (
              items.winThemes.map((item, index) => (
                <CardItem
                  key={`win-${index}`}
                  text={item}
                  index={index}
                  type="winThemes"
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Click on the Win Themes button in the Bid Planner page to
                generate win themes.
              </p>
            )}
          </div>
        </div>

        {/* Differentiating Factors Card */}
        <div className="bg-white rounded-lg shadow w-full">
          <span className="font-medium px-4 py-3 bg-gray-100 rounded-t-lg border-b w-full block text-gray-hint_text">
            Differentiating Factors
          </span>
          <div className="h-64 overflow-y-auto space-y-2">
            {items.factors.length > 0 ? (
              items.factors.map((item, index) => (
                <CardItem
                  key={`factor-${index}`}
                  text={item}
                  index={index}
                  type="factors"
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">
                Click on the Differentation Opportunities button in the Bid
                Planner page to generate differentation opportunities.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Chat Dialog Component */}
      <AIChatDialog
        isOpen={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        items={{
          painPoints: items.painPoints,
          winThemes: items.winThemes
        }}
        onApplySuggestions={handleApplySuggestions}
        auth={auth}
        userProfile={userProfile}
        organizationUsers={organizationUsers}
        isLoading={isLoading}
        bid_id={sharedState.object_id}
      />

      {/* Solution Accordion */}
      <div className="bg-white rounded-lg w-full">
        <Accordion type="single" collapsible defaultValue="solution" className="w-full">
          <AccordionItem value="solution" className="border-none">
            <AccordionTrigger className="px-4 py-3 w-full text-base font-medium text-gray-hint_text">
              Solution
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <Solution
                initialData={sharedState.solution || {}}
                onSave={(solutionData) => {
                  const updatedState = {
                    ...sharedState,
                    solution: solutionData
                  };
                  setSharedState(updatedState);
                }}
                readOnly={!canUserEdit}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Select Case Studies Accordion */}
      <div className="bg-white rounded-lg w-full">
        <Accordion type="single" collapsible defaultValue="case-studies" className="w-full">
          <AccordionItem value="case-studies" className="border-none">
            <AccordionTrigger className="px-4 py-3 w-full text-base font-medium text-gray-hint_text">
              Select Case Studies
            </AccordionTrigger>
            <AccordionContent className="p-4">
              <SelectCaseStudy />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Accordions Section */}
      <div className="space-y-4">
        {/* Tone of Voice Accordion */}
        <div className="bg-white rounded-lg w-full">
          <Accordion type="single" collapsible defaultValue="tone-of-voice" className="w-full">
            <AccordionItem value="tone-of-voice" className="border-none">
              <AccordionTrigger className="px-4 py-3 w-full text-base font-medium text-gray-hint_text">
                Tone of Voice
              </AccordionTrigger>
              <AccordionContent className="p-4">
                <ToneOfVoiceLibrary />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default BidIntel;
