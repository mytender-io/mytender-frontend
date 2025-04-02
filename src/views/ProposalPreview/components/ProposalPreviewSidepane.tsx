import { useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import { HTTP_PREFIX, API_URL } from "../../../helper/Constants";
import axios from "axios";
import { Send, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
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
import posthog from "posthog-js";
import { formatResponse } from "@/utils/formatResponse";

const ProposalPreviewSidepane = ({
  bid_id,
  open,
  onOpenChange,
  promptTarget,
  promptResult,
  isLoadingEvidence,
  onReplace,
  onCancelPrompt,
  actionType,
  setActionType
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");
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
    if (actionType === "custom") {
      setActiveChatPrompt("custom");
    }
  }, [actionType]);

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
  const typingWorkerRef = useRef(null);

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
      // Check if actionType is custom - don't add a user message in this case
      if (activeChatPrompt !== "custom") {
        setMessages((prev) => {
          const newMessages = [...prev, { type: "user", text: inputValue }];
          setTimeout(scrollToBottom, 10);
          return newMessages;
        });
      } else {
        // For custom actionType, find the last evidence-target message with custom actionType
        const lastCustomTargetIndex = messages.findLastIndex(
          (msg) => msg.type === "evidence-target" && msg.actionType === "custom"
        );

        if (lastCustomTargetIndex !== -1) {
          // Update the message with the prompt
          const updatedMessages = [...messages];
          updatedMessages[lastCustomTargetIndex] = {
            ...updatedMessages[lastCustomTargetIndex],
            prompt: inputValue
          };
          setMessages(updatedMessages);
          setTimeout(scrollToBottom, 10);
        }
      }

      // Call the appropriate endpoint based on the active chat mode
      if (activeChatPrompt === "library") {
        sendLibraryQuestion(inputValue);
      } else if (activeChatPrompt === "tender_docs") {
        sendTenderDocsQuestion(inputValue);
      } else if (activeChatPrompt === "internet") {
        sendInternetQuestion(inputValue);
      } else if (activeChatPrompt === "custom") {
        sendCustomQuestion(inputValue);
      }

      posthog.capture(`${activeChatPrompt}_question_send`, {
        question: inputValue
      });

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

  // Handle scrolling
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Type message animation
  const typeMessage = (message: string) => {
    setIsTyping(true);
    setTypingText("");

    // Store animation state in localStorage for cross-tab persistence
    const animationId = `preview_typing_${Date.now()}`;
    localStorage.setItem(
      animationId,
      JSON.stringify({
        message,
        progress: 0,
        isActive: true,
        timestamp: Date.now()
      })
    );

    // Batch size - characters to add per animation frame
    const batchSize = 5;

    const typeChars = () => {
      // Get current state from localStorage
      const animState = JSON.parse(localStorage.getItem(animationId) || "{}");
      if (!animState.isActive) {
        return; // Animation was stopped
      }

      const { message, progress } = animState;

      if (progress < message.length) {
        // Calculate how many characters to add in this frame (batch)
        const charsToAdd = Math.min(batchSize, message.length - progress);
        const newText = message.substring(0, progress + charsToAdd);

        // Update UI
        setTypingText(newText);

        // Check if we need to scroll (for line breaks)
        for (let i = progress; i < progress + charsToAdd; i++) {
          if (
            message[i] === "\n" ||
            (message[i] === "<" && message.substring(i, i + 4) === "<br>")
          ) {
            setTimeout(scrollToBottom, 10);
            break;
          }
        }

        // Update localStorage state
        localStorage.setItem(
          animationId,
          JSON.stringify({
            message,
            progress: progress + charsToAdd,
            isActive: true,
            timestamp: Date.now()
          })
        );

        // Continue animation with requestAnimationFrame
        // This will continue even when tab is not active
        typingWorkerRef.current = requestAnimationFrame(typeChars);
      } else {
        // Animation complete
        setIsTyping(false);
        scrollToBottom(); // Final scroll at the end of typing
        localStorage.removeItem(animationId);
      }
    };

    // Start the animation
    typingWorkerRef.current = requestAnimationFrame(typeChars);

    // Return cleanup function (not used here but good practice)
    return () => {
      if (typingWorkerRef.current) {
        cancelAnimationFrame(typingWorkerRef.current);
        localStorage.setItem(
          animationId,
          JSON.stringify({
            isActive: false
          })
        );
      }
    };
  };

  // Scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
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
    setMessages((prevMessages) => {
      const newMessages = [
        ...prevMessages,
        { type: "loading", text: "loading" }
      ];
      // Use setTimeout to ensure the DOM updates before scrolling
      setTimeout(scrollToBottom, 10);
      return newMessages;
    });

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

      posthog.capture("answer_received", {
        active_chat_prompt: activeChatPrompt,
        answer: formattedResponse,
        question
      });
    } catch (error) {
      console.error("Error sending library question:", error);
      posthog.capture("question_sending_failed", {
        question,
        active_chat_prompt: activeChatPrompt,
        error
      });

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
    setMessages((prevMessages) => {
      const newMessages = [
        ...prevMessages,
        { type: "loading", text: "loading" }
      ];
      // Use setTimeout to ensure the DOM updates before scrolling
      setTimeout(scrollToBottom, 10);
      return newMessages;
    });

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

      posthog.capture("answer_received", {
        active_chat_prompt: activeChatPrompt,
        answer: formattedResponse,
        question
      });
    } catch (error) {
      console.error("Error sending tender docs question:", error);
      posthog.capture("question_sending_failed", {
        question,
        active_chat_prompt: activeChatPrompt,
        error
      });

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
    setMessages((prevMessages) => {
      const newMessages = [
        ...prevMessages,
        { type: "loading", text: "loading" }
      ];
      // Use setTimeout to ensure the DOM updates before scrolling
      setTimeout(scrollToBottom, 10);
      return newMessages;
    });

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

      posthog.capture("answer_received", {
        active_chat_prompt: activeChatPrompt,
        answer: formattedResponse,
        question
      });
    } catch (error) {
      console.error("Error sending internet question:", error);
      posthog.capture("question_sending_failed", {
        question,
        active_chat_prompt: activeChatPrompt,
        error
      });

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
  const sendCustomQuestion = async (question) => {
    console.log("custom prompt");
    setQuestionAsked(true);
    setIsLoading(true);
    setStartTime(Date.now());

    // Add a temporary bot message with loading dots
    setMessages((prevMessages) => {
      const newMessages = [
        ...prevMessages,
        { type: "loading", text: "loading" }
      ];
      // Use setTimeout to ensure the DOM updates before scrolling
      setTimeout(scrollToBottom, 10);
      return newMessages;
    });

    try {
      const copilot_mode = "4" + question.toLowerCase().replace(/\s+/g, "_");

      const result = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/copilot`,
        {
          input_text: promptTarget,
          extra_instructions: "",
          copilot_mode: copilot_mode,
          datasets: [],
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
      posthog.capture("answer_received", {
        active_chat_prompt: activeChatPrompt,
        answer: formattedResponse,
        question
      });
    } catch (error) {
      console.error("Error sending custom prompt:", error);
      posthog.capture("question_sending_failed", {
        question,
        active_chat_prompt: activeChatPrompt,
        error
      });

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
    setActionType("default");
    setActiveChatPrompt("library");
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);

    posthog.capture("answer_is_copied", {
      text
    });

    // Get the target button element and store original text
    const copyButton = document.activeElement;
    if (copyButton instanceof HTMLButtonElement) {
      const originalText = copyButton.innerHTML;
      copyButton.innerHTML = "<span>Copied</span>";

      // Revert back after 1.5 seconds
      setTimeout(() => {
        copyButton.innerHTML = originalText;
      }, 1500);
    }
  };

  useEffect(() => {
    if (promptTarget) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "evidence-target", text: promptTarget, actionType: actionType }
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
        (msg) => msg.type !== "loading"
      );
      // Then add the evidence message
      setMessages([
        ...messagesWithoutLoading,
        { type: "evidence", text: promptResult }
      ]);
      typeMessage(promptResult);
    }
  }, [isLoadingEvidence, promptResult]);

  // Add a new function to handle insert and track the replaced evidence
  const handleReplaceEvidence = (text: string) => {
    // Get the target button element and store original text
    const insertButton = document.activeElement;
    if (insertButton instanceof HTMLButtonElement) {
      const originalText = insertButton.innerHTML;
      insertButton.innerHTML = "<span>Inserted</span>";

      posthog.capture("evidence_is_replaced", {
        original_text: originalText,
        inserted_text: text
      });

      // Revert back after 1.5 seconds
      setTimeout(() => {
        insertButton.innerHTML = originalText;
      }, 1500);
    }

    onReplace(text);
  };

  // If not open, return null
  if (!open) return null;

  // Render as a rounded card sidebar
  return (
    <div className="shadow-lg flex flex-col w-full h-full bg-white overflow-hidden border border-gray-line">
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
                  onCancelPrompt();
                  onOpenChange(false);
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
                    {message.type === "loading" ? (
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
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleReplaceEvidence(message.text)
                              }
                              className="text-gray-hint_text"
                            >
                              <DataTransferHorizontalIcon />
                              Insert
                            </Button>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-hint_text"
                            >
                              <RefreshArrowIcon />
                              Refine
                            </Button> */}
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
                        {message.type === "evidence-target" && (
                          <span
                            className={cn(
                              "text-gray-hint_text",
                              message.actionType === "custom" && !message.prompt
                                ? ""
                                : "mt-2"
                            )}
                          >
                            {message.actionType === "summarise"
                              ? "Summarise"
                              : message.actionType === "expand"
                                ? "Expand"
                                : message.actionType === "custom"
                                  ? message.prompt
                                  : message.actionType === "evidence"
                                    ? "Evidence"
                                    : ""}
                          </span>
                        )}
                        {message.type === "evidence" ? (
                          <div className="flex gap-1 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleReplaceEvidence(message.text)
                              }
                              className="text-gray-hint_text"
                            >
                              <DataTransferHorizontalIcon />
                              Insert
                            </Button>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-hint_text"
                            >
                              <RefreshArrowIcon />
                              Refine
                            </Button> */}
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
                        ) : null}
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
              className={cn(
                "flex-1 border-none outline-none bg-transparent focus-visible:ring-0 shadow-none text-sm h-8 px-2",
                actionType === "custom" &&
                  "border border-orange-500 ring-1 ring-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500"
              )}
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
            {actionType === "custom" ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-gray-hint_text rounded-2xl",
                        activeChatPrompt === "custom" && "bg-gray text-white"
                      )}
                    >
                      Custom
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Custom Prompt</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPreviewSidepane;

