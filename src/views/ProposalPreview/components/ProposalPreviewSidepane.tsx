import { useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import { HTTP_PREFIX, API_URL } from "../../../helper/Constants";
import axios from "axios";
import { Send, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import ThumbupIcon from "@/components/icons/ThumbupIcon";
import ThumbdownIcon from "@/components/icons/ThumbdownIcon";
import CopyIcon from "@/components/icons/CopyIcon";
import ProfilePhoto from "@/layout/ProfilePhoto";
import FileSearchIcon from "@/components/icons/FileSearchIcon";
import InternetSparkIcon from "@/components/icons/InternetSparkIcon";
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import DataTransferHorizontalIcon from "@/components/icons/DataTransferHorizontalIcon";
import RefreshArrowIcon from "@/components/icons/RefreshArrowIcon";
import { toast } from "react-toastify";

const ProposalPreviewSidepane = ({
  bid_id,
  open,
  onOpenChange,
  promptTarget,
  promptResult,
  isLoadingEvidence,
  onInsert,
  onCancelPrompt
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
  const [messageFeedback, setMessageFeedback] = useState({});
  const [activeChatPrompt, setActiveChatPrompt] = useState("library");

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

  const [insertedEvidenceIndices, setInsertedEvidenceIndices] = useState([]);

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

      // Call the appropriate endpoint based on the active chat mode
      if (activeChatPrompt === "library") {
        sendLibraryQuestion(inputValue);
      } else if (activeChatPrompt === "tender_docs") {
        sendTenderDocsQuestion(inputValue);
      } else if (activeChatPrompt === "internet") {
        sendInternetQuestion(inputValue);
      }

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

  // Function to send library questions (uses /ask_tender_library_question endpoint)
  const sendLibraryQuestion = async (question) => {
    console.log("library question");
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

    try {
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/question`,
        {
          choice: "2", // Default choice for tender docs questions
          broadness: "8", // Default broadness
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
      console.error("Error sending library question:", error);

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

  // Function to send tender questions (uses /question endpoint)
  const sendTenderDocsQuestion = async (question) => {
    console.log("tender library question");
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

      // Replace the temporary loading message with the actual response
      const formattedResponse = formatResponse(result.data);

      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { type: "bot", text: formattedResponse }
      ]);
      typeMessage(formattedResponse);
    } catch (error) {
      console.error("Error sending tender docs question:", error);

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

  // New function to send questions to the internet search endpoint
  const sendInternetQuestion = async (question) => {
    console.log("internet search");
    setQuestionAsked(true);
    setIsLoading(true);
    setStartTime(Date.now());

    // Add a temporary bot message with loading dots
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "bot", text: "loading" }
    ]);

    try {
      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/perplexity`,
        {
          input_text: question + " Respond in a full sentence format.",
          dataset: "default"
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
      typeMessage(formattedResponse);
    } catch (error) {
      console.error("Error sending internet question:", error);

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
    toast.success("Copied to clipboard");
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

  useEffect(() => {
    if (promptTarget) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "evidence-target", text: promptTarget }
      ]);
    }
  }, [promptTarget]);

  useEffect(() => {
    if (isLoadingEvidence) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "loading", text: "loading" }
      ]);
    }
    // When loading finishes and we have a result
    else if (promptResult) {
      // First remove any loading messages
      const messagesWithoutLoading = messages.filter(
        (msg) => msg.text !== "loading"
      );
      // Then add the evidence message
      setMessages([
        ...messagesWithoutLoading,
        { type: "evidence", text: promptResult }
      ]);
    }
  }, [isLoadingEvidence, promptResult]);

  // Modify the handleCancelEvidence function
  const handleCancelEvidence = (messageIndex: number) => {
    // Find the index of the evidence-target message that corresponds to this evidence
    const targetIndex = messages.findIndex(
      (msg, idx) => idx < messageIndex && msg.type === "evidence-target"
    );

    // Remove both the evidence message and its corresponding evidence-target
    setMessages((prevMessages) =>
      prevMessages.filter(
        (_, index: number) => index !== messageIndex && index !== targetIndex
      )
    );

    // Call the parent component's cancel handler
    onCancelPrompt();
    onOpenChange(false);
  };

  // Add a new function to handle insert and track the inserted evidence
  const handleInsertEvidence = (index) => {
    setInsertedEvidenceIndices((prev) => [...prev, index]);
    onInsert();
  };

  // If not open, return null
  if (!open) return null;

  // Render as a rounded card sidebar
  return (
    <div className="shadow-lg w-[450px] flex flex-col h-full bg-white overflow-hidden border border-gray-line">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="font-medium text-center w-full">
                mytender.io Chat
              </h3>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Get information from your content library, the tender docs or the
              internet to help when writing
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 absolute right-2"
                onClick={() => {
                  // Find the last evidence message index
                  const lastEvidenceIndex = messages.findLastIndex(
                    (msg) => msg.type === "evidence"
                  );
                  if (lastEvidenceIndex !== -1) {
                    handleCancelEvidence(lastEvidenceIndex);
                  } else {
                    onCancelPrompt();
                    onOpenChange(false);
                  }
                  // onOpenChange(false);
                }}
              >
                <X size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Close</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="relative flex flex-col justify-between space-y-4 h-full">
            <div
              ref={messagesContainerRef}
              className="flex flex-col flex-1 w-full max-w-4xl mx-auto overflow-y-auto space-y-4"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "group flex min-w-[50px] p-2 rounded-xl items-start gap-3 text-black",
                    message.type === "user"
                      ? "bg-gray-light self-end max-w-xl"
                      : message.type === "evidence-target"
                        ? "bg-gray-light self-end max-w-xl w-5/6"
                        : "bg-transparent"
                  )}
                >
                  <div className="flex-1 flex flex-col">
                    {message.text === "loading" ? (
                      <div className="flex justify-start items-center h-full text-2xl tracking-wider leading-none font-semibold">
                        <span className="animate-[blink_1.4s_infinite] text-orange">
                          .
                        </span>
                        <span className="animate-[blink_1.4s_infinite_0.2s] text-orange">
                          .
                        </span>
                        <span className="animate-[blink_1.4s_infinite_0.4s] text-orange">
                          .
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div
                            className={
                              message.type === "evidence-target"
                                ? "italic border-l-2 border-orange pl-2"
                                : ""
                            }
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
                        {message.type === "evidence-target" && (
                          <span className="text-gray-hint_text mt-2">
                            Evidence
                          </span>
                        )}
                        {/* Add insert button for evidence messages */}
                        {message.type === "evidence" && (
                          <div className="flex gap-1 mt-3">
                            {index}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleInsertEvidence(index)}
                              disabled={insertedEvidenceIndices.includes(index)}
                              className="text-gray-hint_text"
                            >
                              <DataTransferHorizontalIcon />
                              {insertedEvidenceIndices.includes(index)
                                ? "Replaced"
                                : "Replace"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-hint_text"
                            >
                              <RefreshArrowIcon />
                              Refine
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                handleCopyText(message.text);
                              }}
                              className="text-gray-hint_text"
                            >
                              <CopyIcon /> Copy
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

        <div className="px-3 pt-2 pb-1 border border-gray-line space-y-2 shadow-tooltip rounded-2xl mx-3 mb-3">
          <div className="flex items-center rounded-full gap-2">
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
          <div className="flex gap-2">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-gray-hint_text rounded-2xl",
                      activeChatPrompt === "library" && "bg-gray text-white"
                    )}
                    onClick={() => {
                      setActiveChatPrompt("library");
                    }}
                  >
                    Library
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Search your library</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-gray-hint_text rounded-2xl",
                      activeChatPrompt === "tender_docs" && "bg-gray text-white"
                    )}
                    onClick={() => {
                      setActiveChatPrompt("tender_docs");
                    }}
                  >
                    <FileSearchIcon />
                    Tender Docs
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Search tender docs</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-gray-hint_text rounded-2xl",
                      activeChatPrompt === "internet" && "bg-gray text-white"
                    )}
                    onClick={() => {
                      setActiveChatPrompt("internet");
                    }}
                  >
                    <InternetSparkIcon />
                    Internet
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Search the internet</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPreviewSidepane;
