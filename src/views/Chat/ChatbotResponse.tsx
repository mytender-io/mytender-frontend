import { useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import withAuth from "../../routes/withAuth";
import handleGAEvent from "../../utils/handleGAEvent";
import { HTTP_PREFIX, API_URL } from "../../helper/Constants";
import axios from "axios";
import { Send, Trash2 } from "lucide-react";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation";
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
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProfilePhoto from "@/layout/ProfilePhoto";

// Create a global state for chat processing
const globalChatState = {
  isProcessing: false,
  pendingQuestions: [],
  processQueue: async function () {
    if (this.isProcessing || this.pendingQuestions.length === 0) return;

    this.isProcessing = true;
    const { question, token, onComplete } = this.pendingQuestions.shift();

    try {
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/question`,
        {
          choice: "2",
          broadness: "8",
          input_text: question,
          extra_instructions: "",
          datasets: ["default"]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (onComplete) onComplete(result.data);

      // Show notification
      toast.success("New response received from chatbot");
    } catch (error) {
      console.error("Background chat error:", error);
      toast.error("Failed to get response from chatbot");
    } finally {
      this.isProcessing = false;
      this.processQueue(); // Process next in queue
    }
  },
  addToQueue: function (question, token, onComplete) {
    this.pendingQuestions.push({ question, token, onComplete });
    this.processQueue();
  }
};

const ChatbotResponse = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const navigate = useNavigate();
  const [messageFeedback, setMessageFeedback] = useState({});
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chatResponseMessages");
    console.log("Saved messages:", savedMessages);

    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      if (parsedMessages.length > 0) {
        return parsedMessages;
      }
    }
    return [];
    // return [
    //   {
    //     type: "bot",
    //     text: "Welcome to Quick Question! You can ask questions here about your Content Library data."
    //   }
    // ];
  });

  useEffect(() => {
    // Save messages to localStorage whenever they change
    localStorage.setItem("chatResponseMessages", JSON.stringify(messages));
  }, [messages]);

  const [inputValue, setInputValue] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [questionAsked, setQuestionAsked] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Add this ref for the messages container
  const messagesContainerRef = useRef(null);

  // Add this effect to check for background responses
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const pendingNotification = localStorage.getItem(
        "pendingChatNotification"
      );
      if (pendingNotification) {
        const data = JSON.parse(pendingNotification);

        // Check if this response is already in our messages
        const responseExists = messages.some(
          (msg) =>
            msg.type === "bot" && msg.text === formatResponse(data.response)
        );

        if (!responseExists) {
          // First remove any loading message
          setMessages((prevMessages) => {
            const filteredMessages = prevMessages.filter(
              (msg) => msg.text !== "loading"
            );
            return [
              ...filteredMessages,
              { type: "bot", text: formatResponse(data.response) }
            ];
          });
        }

        localStorage.removeItem("pendingChatNotification");
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      setMessages([...messages, { type: "user", text: inputValue }]);
      sendQuestion(inputValue);
      setInputValue("");
    }
  };

  const handleClearMessages = () => {
    setMessages([
      {
        type: "bot",
        text: "Ask questions here about your Tender Library documents"
      }
    ]);
    localStorage.removeItem("chatResponseMessages");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
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
        // Remove the scrollToBottom() call here
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

  const sendQuestion = async (question) => {
    handleGAEvent("Chatbot", "Submit Question", "Submit Button");
    setQuestionAsked(true);
    setIsLoading(true);
    setStartTime(Date.now());

    // Add a temporary bot message with loading dots
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "bot", text: "loading" }
    ]);

    const backgroundInfo = messages
      .map((msg) => `${msg.type}: ${msg.text}`)
      .join("\n");

    // Add to background processing queue
    globalChatState.addToQueue(question, tokenRef.current, (response) => {
      // This callback will be executed when the response is received

      // Store the response in localStorage for retrieval if user navigated away
      localStorage.setItem(
        "pendingChatNotification",
        JSON.stringify({
          response: response,
          timestamp: Date.now()
        })
      );

      // If still on this page, update UI directly
      const formattedResponse = formatResponse(response);
      if (window.location.pathname.includes("/chat")) {
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1), // Remove loading message
          { type: "bot", text: formattedResponse }
        ]);
        typeMessage(formattedResponse);
      }
    });

    // Allow user to navigate away immediately
    setIsLoading(false);
  };

  const handleCopyText = (text: string) => {
    toast.success("Copied to clipboard");
    navigator.clipboard.writeText(text);
  };

  const handleFeedback = (messageIndex: number, feedbackType: string) => {
    setMessageFeedback((prev) => {
      const currentFeedback = prev[messageIndex];

      // If clicking the same button, turn it off
      if (currentFeedback === feedbackType) {
        const newFeedback = { ...prev };
        delete newFeedback[messageIndex];
        return newFeedback;
      }

      if (feedbackType === "positive") {
        toast.success("Received good response");
      } else if (feedbackType === "negative") {
        toast.error("Received bad response");
      }

      // If clicking different button, switch to it
      return {
        ...prev,
        [messageIndex]: feedbackType
      };
    });
  };

  const parentPages = [] as Array<{ name: string; path: string }>;

  // Add a function to navigate away while keeping chat in background
  const navigateAway = (path) => {
    // Save current state
    localStorage.setItem("chatResponseMessages", JSON.stringify(messages));
    navigate(path);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-border px-6 py-2 min-h-14">
        <BreadcrumbNavigation currentPage="Chatbot" parentPages={parentPages} />
      </div>
      <div className="px-6 pt-4 mb-4 flex-1 overflow-y-auto">
        {messages.length > 0 ? (
          <div className="relative flex flex-col justify-between space-y-4 h-full">
            <div
              ref={messagesContainerRef}
              className="flex flex-col flex-1 w-full max-w-3xl mx-auto"
            >
              {messages.map((message, index: number) => (
                <div
                  key={index}
                  className={cn(
                    "group flex min-w-[50px] px-4 py-2 rounded-xl items-start gap-3 text-black",
                    message.type === "user"
                      ? "bg-gray-light self-end max-w-xl mb-4"
                      : "bg-transparent"
                  )}
                >
                  {/* <>
                    {message.type === "user" ? (
                      <User />
                    ) : (
                      <img src={Logo} alt="logo" className="w-6 h-6" />
                    )}
                  </> */}
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
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full border border-gray-border"
                                    onClick={() => handleCopyText(message.text)}
                                  >
                                    <CopyIcon className="text-gray-hint_text" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy response</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
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
                                </TooltipTrigger>
                                <TooltipContent>Good response</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
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
                                </TooltipTrigger>
                                <TooltipContent>Bad response</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full max-w-3xl mx-auto flex items-center bg-white shadow-xl rounded-lg p-2 gap-2 border border-gray-line">
              <Input
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
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-6">
              <h1 className="text-center font-medium">
                Welcome to Quick Question! <br />
                You can ask questions here about your Content Library data.
              </h1>
              <div className="w-full max-w-3xl mx-auto flex items-center bg-white shadow-xl rounded-lg p-2 gap-2 border border-gray-line">
                <Input
                  type="text"
                  placeholder="Please type your question in here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border-none outline-none pr-0 bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 shadow-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  size="icon"
                  className="h-6 w-6 rounded-full"
                >
                  <Send className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* You could add a notification that chat is processing in background */}
      {/* {globalChatState.isProcessing && (
        <div className="fixed bottom-4 right-4 bg-primary text-white p-2 rounded-md shadow-lg">
          Processing chat in background...
        </div>
      )} */}
    </div>
  );
};

// Export the globalChatState to be used elsewhere in the app
export { globalChatState };
export default withAuth(ChatbotResponse);
