import { useRef, useState, useEffect } from "react";
import { useAuthUser } from "react-auth-kit";
import withAuth from "../../routes/withAuth";
import handleGAEvent from "../../utilities/handleGAEvent";
import { HTTP_PREFIX, API_URL } from "../../helper/Constants";
import axios from "axios";
import { Copy, ThumbsDown, ThumbsUp, User, Send, Trash } from "lucide-react";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "../../resources/images/mytender.io_badge.png";
import { DeleteConfirmationDialog } from "@/modals/DeleteConfirmationModal";
import { cn } from "@/utils";

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

    return [
      {
        type: "bot",
        text: "Welcome to Quick Question! You can ask questions here about your Content Library data."
      }
    ];
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
  const [showModal, setShowModal] = useState(false);

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

  const handleCloseModal = () => setShowModal(false);

  const handleClearMessages = () => {
    setMessages([
      {
        type: "bot",
        text: "Welcome to Quick Question! You can ask questions here about your Content Library data."
      }
    ]);
    localStorage.removeItem("chatResponseMessages");
    handleCloseModal();
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

    // Handle newlines for better readability
    response = response.replace(/\n/g, "<br>");

    return response;
  };

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
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between w-full border-b border-border px-6 py-2 min-h-[55px]">
        <BreadcrumbNavigation
          currentPage="Chatbot"
          parentPages={parentPages}
          showHome={true}
        />
      </div>
      <div className="px-6 py-4 h-[calc(100vh-89px)]">
        <div className="relative flex flex-col justify-between space-y-4 h-full">
          <div className="flex flex-col flex-1 max-w-3xl mx-auto overflow-y-auto">
            {messages.map((message, index: number) => (
              <div
                key={index}
                className={cn(
                  "flex min-w-[50px] p-4 rounded-xl mb-4 items-start gap-3",
                  message.type === "user"
                    ? "bg-gray-black text-white self-end max-w-xl"
                    : "bg-gray-light text-gray-hint_text self-end"
                )}
              >
                <>
                  {message.type === "user" ? (
                    <User className="text-white" />
                  ) : (
                    <img src={Logo} alt="logo" className="w-6 h-6" />
                  )}
                </>
                <div className="flex-1 flex flex-col">
                  {message.text === "loading" ? (
                    <div className="flex justify-center items-center h-full text-2xl tracking-wider leading-none font-semibold">
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
                      <div dangerouslySetInnerHTML={{ __html: message.text }} />
                      {message.type === "bot" && (
                        <div className="flex gap-1 mt-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "rounded-full",
                              messageFeedback[index] === "positive" &&
                                "bg-accent"
                            )}
                            onClick={() => handleFeedback(index, "positive")}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "rounded-full",
                              messageFeedback[index] === "negative" &&
                                "bg-accent"
                            )}
                            onClick={() => handleFeedback(index, "negative")}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => handleCopyText(message.text)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="w-full max-w-3xl mx-auto flex items-center bg-gray-bg shadow-xl rounded-lg p-2 gap-2">
            <Input
              type="text"
              placeholder="Please type your question in here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-none outline-none pr-0 bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 shadow-none"
            />
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={handleShowModal}
              className="h-6 w-6 rounded-full"
            >
              <Trash className="h-6 w-6" />
            </Button> */}
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
        <DeleteConfirmationDialog
          isOpen={showModal}
          onClose={handleCloseModal}
          onConfirm={handleClearMessages}
          title="Clear Conversation"
          message="Are you sure you want to clear the entire conversation?"
        />
      </div>
    </div>
  );
};

export default withAuth(ChatbotResponse);
