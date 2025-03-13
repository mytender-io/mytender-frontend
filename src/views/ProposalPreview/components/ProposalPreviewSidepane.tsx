import { useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import handleGAEvent from "../../../utilities/handleGAEvent";
import { HTTP_PREFIX, API_URL } from "../../../helper/Constants";
import axios from "axios";
import { Send, Trash2, MessageSquare, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import ThumbupIcon from "@/components/icons/ThumbupIcon";
import ThumbdownIcon from "@/components/icons/ThumbdownIcon";
import CopyIcon from "@/components/icons/CopyIcon";
import ProfilePhoto from "@/layout/ProfilePhoto";

const ProposalPreviewSidepane = ({ bid_id, open, onOpenChange }) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const [messageFeedback, setMessageFeedback] = useState({});

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("previewSidepaneMessages");

    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      if (parsedMessages.length > 0) {
        return parsedMessages;
      }
    }

    return [];
  });

  useEffect(() => {
    // Save messages to localStorage whenever they change
    localStorage.setItem("previewSidepaneMessages", JSON.stringify(messages));
  }, [messages]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionAsked, setQuestionAsked] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Focus the input field when the sidepane opens
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
    localStorage.removeItem("previewSidepaneMessages");
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

  // Handle scrolling
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Type message animation
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

  // Scroll on new messages when appropriate
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

  // Scroll when sidepane opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          scrollToBottom();
        }
      }, 100);
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

  // If not open, return null
  if (!open) return null;

  // Render as a rounded card sidebar
  return (
    // <div className="fixed right-5 bottom-5 max-h-[80vh] shadow-lg rounded-2xl w-80 flex flex-col bg-white overflow-hidden">
    <div className="shadow-lg rounded-2xl w-[336px] flex flex-col h-full bg-white overflow-hidden">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-center w-full">mytender.io Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 absolute right-2"
          onClick={() => onOpenChange(false)}
        >
          <X size={16} />
        </Button>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <div className="relative flex flex-col justify-between space-y-4 h-full">
            <div
              ref={messagesContainerRef}
              className="flex flex-col flex-1 w-full max-w-4xl mx-auto overflow-y-auto scrollbar-none"
            >
              {messages.map((message, index) => (
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
                              onClick={() => handleFeedback(index, "positive")}
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
                              onClick={() => handleFeedback(index, "negative")}
                            >
                              <ThumbdownIcon />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center bg-gray-50 rounded-full p-2 gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Send a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-none outline-none bg-transparent focus-visible:ring-0 shadow-none text-sm h-8 px-2"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearMessages}
              className="h-6 w-6 p-0"
            >
              <Trash2 className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading}
              size="icon"
              className="h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-600"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex border-t border-gray-100 text-xs">
        <button className="flex-1 p-2 hover:bg-gray-50 text-gray-500 flex items-center justify-center">
          <span className="mr-1">Library</span>
        </button>
        <button className="flex-1 p-2 hover:bg-gray-50 text-gray-500 flex items-center justify-center">
          <span className="mr-1">Tender Docs</span>
        </button>
        <button className="flex-1 p-2 hover:bg-gray-50 text-gray-500 flex items-center justify-center">
          <span className="mr-1">Internet</span>
        </button>
      </div>
    </div>
  );
};

export default ProposalPreviewSidepane;
