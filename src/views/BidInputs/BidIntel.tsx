import { useContext, useMemo, useState, useRef, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import { BidContext } from "../BidWritingStateManagerView";
import { Check, Pencil, X, Sparkles, Send, Trash2, Square } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/utils";
import CopyIcon from "@/components/icons/CopyIcon";
import ThumbupIcon from "@/components/icons/ThumbupIcon";
import ThumbdownIcon from "@/components/icons/ThumbdownIcon";
import ProfilePhoto from "@/layout/ProfilePhoto";
import { useUserData } from "@/context/UserDataContext";

interface Message {
  type: "user" | "bot";
  text: string;
}

interface FeedbackState {
  [key: number]: string;
}

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

  // Process the shared state data for display
  const items = {
    painPoints: sharedState.customer_pain_points || [],
    winThemes: sharedState.win_themes || [],
    factors: sharedState.differentiating_factors || []
  };

  const currentUserPermission = contributors[auth?.email] || "viewer";

  const canUserEdit =
    currentUserPermission === "admin" || currentUserPermission === "editor";

  // State for AI chat
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<FeedbackState>({});

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingWorkerRef = useRef<number | null>(null);
  const fullResponseRef = useRef<string>("");

  const { userProfile, organizationUsers, isLoading } = useUserData();

  // Focus the input field when the dialog opens
  useEffect(() => {
    if (isAIModalOpen && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isAIModalOpen]);

  // Scroll on new messages and when typing updates
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  // Scroll when dialog opens
  useEffect(() => {
    if (isAIModalOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isAIModalOpen]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

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

  // Handle opening AI modal - updated to handle combined editing
  const handleOpenAIModal = () => {
    if (!canUserEdit) {
      showViewOnlyMessage();
      return;
    }

    // Initialize with system greeting
    setMessages([
      {
        type: "bot",
        text: "I can help you improve your customer pain points and win themes for your bid proposal. What would you like me to do?"
      }
    ]);
    setIsAIModalOpen(true);
  };

  // Stop typing animation and show full response
  const stopTyping = () => {
    if (typingWorkerRef.current) {
      cancelAnimationFrame(typingWorkerRef.current);
      typingWorkerRef.current = null;
    }

    // Only keep what has been typed so far
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      if (lastMessage.type === "bot") {
        return [
          ...prevMessages.slice(0, -1),
          { ...lastMessage, text: typingText }
        ];
      }
      return prevMessages;
    });

    setIsTyping(false);
    fullResponseRef.current = "";
    scrollToBottom();
  };

  // Typing effect for bot responses
  const typeMessage = (message: string) => {
    setIsTyping(true);
    setTypingText("");
    fullResponseRef.current = message;

    // Batch size - characters to add per animation frame
    const batchSize = 5;
    let progress = 0;

    const typeChars = () => {
      if (progress < message.length) {
        // Calculate how many characters to add in this frame
        const charsToAdd = Math.min(batchSize, message.length - progress);
        const newText = message.substring(0, progress + charsToAdd);

        // Update UI
        setTypingText(newText);

        // Update progress
        progress += charsToAdd;

        // Continue animation
        typingWorkerRef.current = requestAnimationFrame(typeChars);
      } else {
        // Animation complete
        setIsTyping(false);
        fullResponseRef.current = "";
        scrollToBottom();
      }
    };

    // Start the animation
    typingWorkerRef.current = requestAnimationFrame(typeChars);

    // Return cleanup function
    return () => {
      if (typingWorkerRef.current) {
        cancelAnimationFrame(typingWorkerRef.current);
      }
    };
  };

  // Handle sending message
  const handleSendMessage = () => {
    if (isTyping) {
      // If typing is in progress, stop it
      stopTyping();
      return;
    }

    if (inputValue.trim() !== "") {
      setMessages([...messages, { type: "user", text: inputValue }]);
      sendQuestion();
      setInputValue("");
    }
  };

  // Updated mock suggestions generator
  const generateMockSuggestions = () => {
    return "Here are my suggestions for your bid:\n\n*Customer Pain Points:*\n1. Consider adding a point about difficulty with current solution scalability\n2. The pain point about budget constraints could be more specific\n3. Add a point about integration issues with existing systems\n\n*Win Themes:*\n1. Your win theme about cost savings could be strengthened with specific metrics\n2. Consider adding a theme about your proven implementation methodology\n3. Highlight your unique approach to post-implementation support";
  };

  // Updated to handle combined suggestions
  const handleUpdateWithAISuggestions = () => {
    // Process bot responses to extract suggestions
    const allSuggestions = messages
      .filter((msg) => msg.type === "bot")
      .flatMap((msg) => msg.text.split("\n"))
      .filter((line) => /^\d+\./.test(line.trim()));

    const painPointSuggestions = allSuggestions
      .filter((line) => {
        const lowerCaseLine = line.toLowerCase();
        return (
          lowerCaseLine.includes("pain") ||
          (lowerCaseLine.includes("customer") && !lowerCaseLine.includes("win"))
        );
      })
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line) => line.length > 0);

    const winThemeSuggestions = allSuggestions
      .filter((line) => {
        const lowerCaseLine = line.toLowerCase();
        return lowerCaseLine.includes("win") || lowerCaseLine.includes("theme");
      })
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line) => line.length > 0);

    if (painPointSuggestions.length === 0 && winThemeSuggestions.length === 0) {
      toast.error("No valid suggestions found in the conversation");
      return;
    }

    // Update state based on the suggestions
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
    setIsAIModalOpen(false);
  };

  // Simulate API call to process message - updated for combined approach
  const sendQuestion = async () => {
    setIsChatLoading(true);

    // Add a temporary bot message with loading dots
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "bot", text: "loading" }
    ]);

    // Simulate API call delay
    setTimeout(() => {
      // This would be replaced with actual API call
      const mockResponse = `I've analyzed your bid proposal content and here are my suggestions:\n\n${generateMockSuggestions()}`;

      // Replace loading message with actual response
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { type: "bot", text: mockResponse }
      ]);

      // Start typing animation
      typeMessage(mockResponse);
      setIsChatLoading(false);
    }, 1500);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isTyping) {
        stopTyping();
      } else if (!isChatLoading) {
        handleSendMessage();
      }
    }
  };

  // Clear all messages
  const handleClearMessages = () => {
    setMessages([
      {
        type: "bot",
        text: "I can help you improve your customer pain points and win themes for your bid proposal. What would you like me to do?"
      }
    ]);
  };

  // Copy message to clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Handle message feedback
  const handleFeedback = (messageIndex: number, feedbackType: string) => {
    setMessageFeedback((prev) => {
      const currentFeedback = prev[messageIndex];

      // If clicking the same button, turn it off
      if (currentFeedback === feedbackType) {
        const newFeedback = { ...prev };
        delete newFeedback[messageIndex];
        return newFeedback;
      }

      // If clicking different button, switch to it
      return {
        ...prev,
        [messageIndex]: feedbackType
      };
    });
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
    <>
      <div
        className="calendly-inline-widget h-[1000px] lg:h-[660px] w-full"
        data-url="https://calendly.com/mytender_io/mytender-io-discovery-call?month=2025-04"
        data-processed="true"
      >
        <iframe
          src="https://calendly.com/mytender_io/mytender-io-discovery-call?embed_domain=my-tender-six.vercel.app&amp;embed_type=Inline&amp;month=2025-04"
          width="100%"
          height="100%"
          frameBorder="0"
          title="Select a Date &amp; Time - Calendly"
        ></iframe>
      </div>

      {/* Add AI Edit button at the top */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          className="flex gap-1 items-center"
          onClick={handleOpenAIModal}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Edit Content</span>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Customer Pain Points Card - remove AI Edit button */}
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

        {/* Win Themes Card - remove AI Edit button */}
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

        {/* Differentiating Factors Card - no changes needed */}
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

      {/* AI Chat Modal - updated for combined editing */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="max-w-6xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>AI Assistant - Bid Content Editor</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Current items display - updated to show both pain points and win themes */}
            <div className="px-6 py-3 border-b">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Current Customer Pain Points:
                  </h3>
                  <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1 max-h-32 overflow-y-auto">
                    {items.painPoints.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                    {items.painPoints.length === 0 && (
                      <li className="text-gray-400">No pain points yet</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Current Win Themes:
                  </h3>
                  <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1 max-h-32 overflow-y-auto">
                    {items.winThemes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                    {items.winThemes.length === 0 && (
                      <li className="text-gray-400">No win themes yet</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 flex-1 overflow-y-auto">
              <div className="relative flex flex-col justify-between space-y-4 h-full">
                <div
                  ref={messagesContainerRef}
                  className="flex flex-col flex-1 w-full max-w-4xl mx-auto overflow-y-auto scrollbar-none"
                >
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "group flex min-w-[50px] px-4 py-2 rounded-xl items-start gap-3 text-black",
                          message.type === "user"
                            ? "bg-gray-light self-end max-w-xl mb-4"
                            : "bg-transparent"
                        )}
                      >
                        <div className="flex-1 flex flex-col">
                          {message.text === "loading" ? (
                            <div className="flex justify-start items-center h-full text-2xl tracking-wider leading-none font-semibold">
                              <span className="animate-[blink_1.4s_infinite] text-black">
                                .
                              </span>
                              <span className="animate-[blink_1.4s_infinite_0.2s] text-black">
                                .
                              </span>
                              <span className="animate-[blink_1.4s_infinite_0.4s] text-black">
                                .
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      isTyping && index === messages.length - 1
                                        ? typingText.replace(/\n/g, "<br>")
                                        : message.text.replace(/\n/g, "<br>")
                                  }}
                                />
                                {message.type === "user" && (
                                  <div className="flex items-center gap-1">
                                    {auth?.profileUrl ? (
                                      <img
                                        src={auth?.profileUrl}
                                        alt="Profile"
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                    ) : (
                                      <ProfilePhoto
                                        size="sm"
                                        userProfile={userProfile}
                                        organizationUsers={organizationUsers}
                                        isLoading={isLoading}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                              {message.type === "bot" && (
                                <div
                                  className={cn(
                                    "flex gap-1 mt-3",
                                    index === messages.length - 1
                                      ? isTyping
                                        ? "opacity-0"
                                        : "relative"
                                      : "opacity-0 group-hover:opacity-100 transition-opacity"
                                  )}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full border border-gray-border"
                                    onClick={() => handleCopyText(message.text)}
                                  >
                                    <CopyIcon className="text-gray-hint_text" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "rounded-full border border-gray-border hover:text-gray-hint_text",
                                      messageFeedback[index] === "positive"
                                        ? "bg-gray-hint_text text-white"
                                        : "text-gray-hint_text"
                                    )}
                                    onClick={() =>
                                      handleFeedback(index, "positive")
                                    }
                                  >
                                    <ThumbupIcon />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "rounded-full border border-gray-border hover:text-gray-hint_text",
                                      messageFeedback[index] === "negative"
                                        ? "bg-gray-hint_text text-white"
                                        : "text-gray-hint_text"
                                    )}
                                    onClick={() =>
                                      handleFeedback(index, "negative")
                                    }
                                  >
                                    <ThumbdownIcon />
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Start a conversation to get AI assistance with your bid
                      content.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="w-full flex items-center bg-white shadow-lg rounded-lg p-2 gap-2 border border-gray-line">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border-none outline-none pr-0 bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 shadow-none"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleClearMessages}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear messages</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  onClick={handleSendMessage}
                  disabled={isChatLoading && !isTyping}
                  size="icon"
                  className="h-6 w-6 rounded-full"
                >
                  {isTyping ? <Square className="fill-current" /> : <Send />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setIsAIModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWithAISuggestions}>
              Apply Suggestions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Solution Accordion */}
      <div className="bg-white rounded-lg w-full">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="solution" className="border-none">
            <AccordionTrigger className="px-4 py-3 w-full text-lg text-gray-hint_text">
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
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="case-studies" className="border-none">
            <AccordionTrigger className="px-4 py-3 w-full text-lg text-gray-hint_text">
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
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="tone-of-voice" className="border-none">
              <AccordionTrigger className="px-4 py-3 w-full text-lg text-gray-hint_text">
                Tone of Voice
              </AccordionTrigger>
              <AccordionContent className="p-4">
                <ToneOfVoiceLibrary />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
};

export default BidIntel;
