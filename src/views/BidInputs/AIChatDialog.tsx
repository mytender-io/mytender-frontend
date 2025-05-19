import { useState, useRef, useEffect } from "react";
import { Send, Trash2, Square } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import axios from "axios";
import { API_URL, HTTP_PREFIX } from "@/helper/Constants";
import { formatResponse } from "@/utils/formatResponse"; // Import the same formatter as TenderLibraryChatDialog

interface Message {
  type: "user" | "bot";
  text: string;
}

interface FeedbackState {
  [key: number]: string;
}

interface AIChatDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: {
    painPoints: string[];
    winThemes: string[];
  };
  onApplySuggestions: (painPoints: string[], winThemes: string[]) => void;
  auth: any;
  userProfile: any;
  organizationUsers: any;
  isLoading: boolean;
  bid_id?: string; // Added bid_id as an optional prop
}

const AIChatDialog = ({
  isOpen,
  onOpenChange,
  items,
  onApplySuggestions,
  auth,
  userProfile,
  organizationUsers,
  isLoading,
  bid_id // Default to empty string if not provided
}: AIChatDialogProps) => {
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

  // Initialize with system greeting when the dialog opens
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          type: "bot",
          text: "Would you like to modify or edit any in particular?"
        }
      ]);

      // Focus the input field when the dialog opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Scroll on new messages and when typing updates
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  // Scroll when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
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
      sendQuestion(inputValue);
      setInputValue("");
    }
  };

  const handleUpdateWithAISuggestions = async () => {
    try {
      // Show loading state
      toast.info("Processing suggestions...");

      // Extract all conversation messages to send to the API
      const conversationHistory = messages
        .map((msg) => `${msg.type}: ${msg.text}`)
        .join("\n");

      // Call the specialized endpoint for extracting suggestions
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/apply_bid_input_suggestions`,
        {
          chat_history: conversationHistory,
          bid_id: bid_id || ""
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      // Extract pain points and win themes from the response
      const { pain_points = [], win_themes = [] } = result.data;

      // Verify we got something back
      if (pain_points.length === 0 && win_themes.length === 0) {
        toast.warning("No suggestions were found in the conversation");
        return;
      }

      // Apply the suggestions
      onApplySuggestions(pain_points, win_themes);

      // Close the dialog and show success message
      onOpenChange(false);
      toast.success(`Win themes and pain points updated`);
    } catch (error) {
      console.error("Error applying suggestions:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to process suggestions. Please try again."
      );
    }
  };

  // Send question to tender library API - using the same endpoint as TenderLibraryChatDialog
  const sendQuestion = async (question: string) => {
    setIsChatLoading(true);

    // Add a temporary bot message with loading dots
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "bot", text: "loading" }
    ]);

    const backgroundInfo = messages
      .map((msg) => `${msg.type}: ${msg.text}`)
      .join("\n");

    console.log("conversational history");
    console.log(backgroundInfo);

    try {
      // Use the same endpoint and request structure as TenderLibraryChatDialog
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/ask_bid_inputs_question`,
        {
          question: question,
          chat_history: backgroundInfo,
          bid_id: bid_id || ""
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );

      // Replace loading message with actual response
      const formattedResponse = formatResponse(result.data);

      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { type: "bot", text: formattedResponse }
      ]);

      // Start typing animation
      typeMessage(formattedResponse);
    } catch (error) {
      console.error("Error sending tender docs question:", error);

      // Replace the loading message with an error message
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        {
          type: "bot",
          text:
            error.response?.status === 400
              ? "Message failed, please contact support..."
              : error.message ||
                "An error occurred while processing your request"
        }
      ]);
    }

    setIsChatLoading(false);
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
        text: "Would you like to modify or edit any in particular?"
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Bid Inputs</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col overflow-y-scroll">
          <div className="px-6 py-4 space-y-4">
            <div className="flex flex-col gap-4">
              <span>
                Here are your inputs for creating a great bid response:
              </span>
              <div className="p-3 bg-gray-spacer_light rounded-2xl">
                <h3 className="text-sm font-medium mb-2">
                  Current Customer Pain Points:
                </h3>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  {items.painPoints.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                  {items.painPoints.length === 0 && (
                    <li className="text-gray-400">No pain points yet</li>
                  )}
                </ul>
              </div>
              <div className="p-3 bg-gray-spacer_light rounded-2xl">
                <h3 className="text-sm font-medium mb-2">
                  Current Win Themes:
                </h3>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  {items.winThemes.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                  {items.winThemes.length === 0 && (
                    <li className="text-gray-400">No win themes yet</li>
                  )}
                </ul>
              </div>
            </div>
            <div
              ref={messagesContainerRef}
              className="flex flex-col flex-1 w-full max-w-4xl mx-auto overflow-y-auto scrollbar-none text-sm"
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

          <div className="p-4">
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateWithAISuggestions}>
            Apply Suggestions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatDialog;
