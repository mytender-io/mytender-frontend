import { useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import withAuth from "../../routes/withAuth";
import handleGAEvent from "../../utilities/handleGAEvent";
import { HTTP_PREFIX, API_URL } from "../../helper/Constants";
import axios from "axios";
import { Send } from "lucide-react";
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
import UserIcon from "@/components/icons/UserIcon";

const ChatbotResponse = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
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

  const [choice, setChoice] = useState("2");
  const [broadness, setBroadness] = useState("2");

  const [isLoading, setIsLoading] = useState(false);
  const [questionAsked, setQuestionAsked] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Add this ref for the messages container
  const messagesContainerRef = useRef(null);

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

  // Modify the typeMessage function to scroll while typing
  const typeMessage = (message) => {
    setIsTyping(true);
    setTypingText("");
    let index = 0;

    const typeChar = () => {
      if (index < message.length) {
        setTypingText((prev) => prev + message[index]);
        index++;
        scrollToBottom(); // Add scroll after each character
        setTimeout(typeChar, 1);
      } else {
        setIsTyping(false);
      }
    };

    typeChar();
  };

  // Add useEffect to scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    console.log(backgroundInfo);

    try {
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/question`,
        {
          choice: choice,
          broadness: broadness,
          input_text: question,
          extra_instructions: backgroundInfo,
          datasets: ["default"]
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

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

  const parentPages = [] as Array<{ name: string; path: string }>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-border px-6 py-2 min-h-[3.43785rem]">
        <BreadcrumbNavigation
          currentPage="Chatbot"
          parentPages={parentPages}
          showHome={true}
        />
      </div>
      <div className="px-6 py-4 flex-1 overflow-y-auto">
        {messages.length > 0 ? (
          <div className="relative flex flex-col justify-between space-y-4 h-full">
            <div
              ref={messagesContainerRef}
              className="flex flex-col flex-1 w-full max-w-3xl mx-auto overflow-y-auto scrollbar-none"
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
                                <UserIcon
                                  className={cn(
                                    "min-w-5 min-h-5 text-gray-hint_text"
                                  )}
                                  width={20}
                                  height={20}
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
    </div>
  );
};

export default withAuth(ChatbotResponse);
