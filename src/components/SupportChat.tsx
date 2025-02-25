import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { API_URL, HTTP_PREFIX } from "../helper/Constants.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useAuthUser } from "react-auth-kit";
import { MessageCircleQuestion, X } from "lucide-react";

const SupportChat = () => {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const [inputMessage, setInputMessage] = useState("");
  const getAuth = useAuthUser();
  const auth = getAuth();
  const latestMessageIdRef = useRef(null);

  const processMessage = (msg) => {
    console.log("Processing message:", JSON.stringify(msg));
    let text = msg.text;
    let isUserMessage = false;

    console.log("Initial text:", text);

    // Remove the unexpected "!" prefix if present
    if (text.startsWith("!")) {
      console.log("Found '!' prefix, removing...");
      text = text.slice(1).trim();
      console.log("Text after removing '!':", text);
    }

    // Check for "USER" prefix
    if (text.startsWith("USER ")) {
      console.log("Found 'USER' prefix, marking as user message...");
      isUserMessage = true;
      text = text.slice(5).trim();
      console.log("Text after removing 'USER':", text);
    }

    const processedMsg = {
      ...msg,
      isUserMessage,
      text
    };

    return processedMsg;
  };

  const fetchMessages = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/slack_get_messages`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );
      const { messages: fetchedMessages } = response.data;

      if (Array.isArray(fetchedMessages)) {
        setMessages((prevMessages) => {
          const newMessages = fetchedMessages.filter(
            (fMsg) => !prevMessages.some((msg) => msg.id === fMsg.id)
          );

          // Check if there are any new non-user messages (replies)
          const hasNewReplies = newMessages.some(msg => 
            !msg.text.startsWith("USER ") && 
            (!latestMessageIdRef.current || msg.id !== latestMessageIdRef.current)
          );

          if (hasNewReplies && prevMessages.length > 0 && !isOpen) {
            setHasNewMessages(true);
          }

          const updatedMessages = [
            ...prevMessages,
            ...newMessages.map((msg) => {
              const processedMsg = processMessage(msg);
              return processedMsg;
            })
          ];

          // Update latest message id
          if (updatedMessages.length > 0) {
            latestMessageIdRef.current = updatedMessages[updatedMessages.length - 1].id;
          }

          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [auth?.token, isOpen]);

  useEffect(() => {
    if (auth?.token) {
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 5000);
      return () => clearInterval(intervalId);
    }
  }, [auth?.token, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      handleNewUserMessage(inputMessage);
      setInputMessage(""); // Clear input immediately after sending
    }
  };

  const handleNewUserMessage = async (newMessage) => {
    try {
      const formData = new FormData();
      formData.append("message", `USER ${newMessage}`);
      const response = await axios.post(
        `http${HTTP_PREFIX}://${API_URL}/slack_send_message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      const { message, error } = response.data;
      if (error) {
        console.error("Error sending message:", error);
      } else if (typeof message === "string") {
        console.log("Raw new user message:", message);
        const newUserMessage = processMessage({
          id: new Date().getTime().toString(),
          text: message
        });
        console.log(
          "Processed new user message:",
          JSON.stringify(newUserMessage)
        );
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setHasNewMessages(false);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  const notRenderedUrls = [
    "/chatResponse",
    "/question-crafter",
    "/signup",
    "/reset_password",
    "/login"
  ];
  if (notRenderedUrls.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpenChat}
        className="text-gray-500 hover:text-gray-700 transition-colors duration-300 ml-2 relative"
      >
        <MessageCircleQuestion className="w-6 h-6" />
        {hasNewMessages && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
        )}
        <span className="sr-only">{isOpen ? "Close Chat" : "Open Chat"}</span>
      </button>
      {isOpen && (
        <div className="w-[350px] h-[500px] rounded-xl flex flex-col bg-white shadow-lg absolute top-10 right-0 z-50 m-0 p-0 border border-gray-200">
          <div className="w-full h-28 bg-white text-gray-800 text-center p-4 flex flex-col items-center justify-center rounded-t-xl border-b relative">
            <button 
              onClick={handleCloseChat}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold">Support Chat</h3>
            <p className="text-gray-500 mt-1 text-sm">Ask us anything</p>
          </div>
          <div className="flex-grow overflow-y-auto p-3 flex flex-col">
            {messages.map((msg, index) => {
              return (
                <div
                  key={msg.id || index}
                  className={`w-full flex mb-2 ${msg.isUserMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                      msg.isUserMessage
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="w-full p-3 flex flex-col max-h-16 bg-white rounded-b-xl border-t">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                className="flex-1 py-1.5 px-3 text-sm rounded-l-lg bg-white border border-gray-200 focus:outline-none focus:border-orange-400"
              />
              <button
                onClick={handleSendMessage}
                className="bg-orange-500 text-white py-1.5 px-3 rounded-r-lg focus:outline-none hover:bg-orange-600 transition-colors"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChat;