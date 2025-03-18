import { useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import handleGAEvent from "../../../utils/handleGAEvent";
import { HTTP_PREFIX, API_URL } from "../../../helper/Constants";
import axios from "axios";
import { Send, Trash2, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import ThumbupIcon from "@/components/icons/ThumbupIcon";
import ThumbdownIcon from "@/components/icons/ThumbdownIcon";
import CopyIcon from "@/components/icons/CopyIcon";
import { TooltipContent } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import ProfilePhoto from "@/layout/ProfilePhoto";

const TenderLibraryChatDialog = ({
  bid_id,
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const [messageFeedback, setMessageFeedback] = useState({});

  // Use internal state if external control props aren't provided
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if we're using controlled or uncontrolled mode
  const isControlled =
    externalOpen !== undefined && externalOnOpenChange !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? externalOnOpenChange : setInternalOpen;

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("tenderLibChatMessages");

    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      if (parsedMessages.length > 0) {
        return parsedMessages;
      }
    }

    return [
      // {
      //   type: "bot",
      //   text: "Ask questions here about your Tender Library documents"
      // }
    ];
  });

  useEffect(() => {
    // Save messages to localStorage whenever they change
    localStorage.setItem("tenderLibChatMessages", JSON.stringify(messages));
  }, [messages]);

  const [inputValue, setInputValue] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [questionAsked, setQuestionAsked] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Add this ref for the messages container
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Focus the input field when the dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [open]);

  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      setMessages([...messages, { type: "user", text: inputValue }]);
      sendQuestion(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  const handleClearMessages = () => {
    setMessages([
      {
        type: "bot",
        text: "Ask questions here about your Tender Library documents"
      }
    ]);
    localStorage.removeItem("tenderLibChatMessages");
  };

  const formatResponse = (response) => {
    // Handle numbered lists
    response = response.replace(/^\d+\.\s(.+)$/gm, "<li>$1</li>");
    if (response.includes("<li>")) {
      response = `<ol>${response}</ol>`;
    }

    // Handle bullet points
    response = response.replace(/^[-•]\s(.+)$/gm, "<li>$1</li>");
    if (response.includes("<li>") && !response.includes("<ol>")) {
      response = `<ul>${response}</ul>`;
    }

    // Handle bold text
    response = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Handle italic text
    response = response.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Replace any newlines with a single <br>
    response = response.replace(/\n/g, "<br>");

    response = response.replace(/(<br>)\s*(<br>)/g, "<br><br>");
    response = response.replace(/(<\/li>)(<br>)+/g, "</li><br>");

    return response;
  };

  // Add this function to handle scrolling
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Modify the typeMessage function to not force scroll while typing
  const typeMessage = (message) => {
    setIsTyping(true);
    setTypingText("");
    let index = 0;

    const typeChar = () => {
      if (index < message.length) {
        setTypingText((prev) => prev + message[index]);
        index++;
        setTimeout(typeChar, 1);
      } else {
        setIsTyping(false);
        scrollToBottom(); // Only scroll at the end of typing
      }
    };

    typeChar();
  };

  // Modify useEffect to only scroll on new messages when appropriate
  useEffect(() => {
    // Only auto-scroll if user is already at the bottom
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 100;

      if (isAtBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

  // Scroll when dialog opens, but only if at bottom
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          const isAtBottom =
            container.scrollHeight - container.scrollTop <=
            container.clientHeight + 100;

          if (isAtBottom) {
            scrollToBottom();
          }
        }
      }, 100); // Small delay to ensure dialog is fully rendered
    }
  }, [open]);

  const sendQuestion = async (question) => {
    handleGAEvent("Chatbot", "Submit Question", "Submit Button");
    setQuestionAsked(true);
    setIsLoading(true);
    setStartTime(Date.now()); // Set start time for the timer

    // Add a temporary bot message with loading dots
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "bot", text: "loading" }
    ]);

    const backgroundInfo = messages
      .map((msg) => `${msg.type}: ${msg.text}`)
      .join("\n");

    try {
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/ask_tender_library_question`,
        {
          question: question,
          chat_history: backgroundInfo,
          bid_id: bid_id
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      console.log(result);

      // Replace the temporary loading message with the actual response
      const formattedResponse = formatResponse(result.data);

      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { type: "bot", text: formattedResponse }
      ]);
      typeMessage(formattedResponse); // Start typing animation
    } catch (error) {
      console.error("Error sending question:", error);

      // Replace the temporary loading message with the error message
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        {
          type: "bot",
          text:
            error.response?.status === 400
              ? "Message failed, please contact support..."
              : error.message
        }
      ]);
    }
    setIsLoading(false);
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleFeedback = (messageIndex, feedbackType) => {
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

  // Count unread messages (simple version - just counting bot messages after the last user message)
  const getUnreadCount = () => {
    const lastUserIndex = [...messages]
      .reverse()
      .findIndex((msg) => msg.type === "user");
    return lastUserIndex === -1 ? 0 : lastUserIndex;
  };

  const unreadCount = getUnreadCount();

  // Only render the trigger if we're not in controlled mode
  // For controlled mode, the parent is responsible for opening the dialog
  const dialogContent = (
    <DialogContent className="max-w-6xl h-[80vh] flex flex-col p-0">
      <DialogHeader className="px-6 py-4 border-b">
        <DialogTitle>Tender Library Chat</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col flex-1 overflow-hidden">
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
                                    ? typingText
                                    : message.text
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
                                  <ProfilePhoto size="sm" />
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
                <>Ask questions here about your Tender Library documents</>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t">
          <div className="w-full flex items-center bg-white shadow-lg rounded-lg p-2 gap-2 border border-gray-line">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Please type your question in here..."
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
              disabled={isLoading}
              size="icon"
              className="h-6 w-6 rounded-full pr-[1px] pt-[1px]"
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  // For controlled mode, we don't need the trigger
  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  // For uncontrolled mode, we include the trigger
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 relative"
          onClick={() =>
            handleGAEvent("Chatbot", "Open Dialog", "Tender Library Chat")
          }
        >
          <MessageSquare className="h-5 w-5" />
          <span>Tender Library Chat</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
};

export default TenderLibraryChatDialog;
