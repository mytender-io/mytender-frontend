import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { API_URL, HTTP_PREFIX } from "../helper/Constants.tsx";
import { useAuthUser } from "react-auth-kit";
import { MessageCircleQuestion, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { cn } from "@/utils";
import { toast } from "react-toastify";

const SupportChat = () => {
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const [inputMessage, setInputMessage] = useState("");
  const getAuth = useAuthUser();
  const auth = getAuth();
  const latestMessageIdRef = useRef(null);
  const userSentMessageRef = useRef(false);
  const notifiedMessageIdsRef = useRef(new Set());
  // const notificationSound = useRef(new Audio("/notification.mp3"));

  const processMessage = (msg) => {
    //console.log("Processing message:", JSON.stringify(msg));
    let text = msg.text;
    let isUserMessage = false;
    //console.log("Initial text:", text);
    // Remove the unexpected "!" prefix if present
    if (text.startsWith("!")) {
      //console.log("Found '!' prefix, removing...");
      text = text.slice(1).trim();
      //console.log("Text after removing '!':", text);
    }
    // Check for "USER" prefix
    if (text.startsWith("USER ")) {
      //console.log("Found 'USER' prefix, marking as user message...");
      isUserMessage = true;
      text = text.slice(5).trim();
      //console.log("Text after removing 'USER':", text);
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
          const newSupportReplies = newMessages.filter(
            (msg) =>
              !msg.text.startsWith("USER ") &&
              !notifiedMessageIdsRef.current.has(msg.id)
          );

          const hasNewSupportReplies = newSupportReplies.length > 0;

          // Show toast notification and play sound only if there are new support replies
          // and we didn't just send a message ourselves
          if (
            hasNewSupportReplies &&
            prevMessages.length > 0 &&
            !userSentMessageRef.current
          ) {
            if (!open) {
              setHasNewMessages(true);
            }

            // Track which messages we've already shown notifications for
            newSupportReplies.forEach((msg) => {
              // Only show one notification regardless of how many new messages
              if (msg.id && !notifiedMessageIdsRef.current.has(msg.id)) {
                notifiedMessageIdsRef.current.add(msg.id);
              }
            });

            // Show toast notification for support replies only (just once)
            toast.info("New support message received", {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              toastId: "new-support-message" // Prevents duplicate toasts
            });

            // Play notification sound
            // try {
            //   notificationSound.current.play().catch(e => console.error("Failed to play notification sound:", e));
            // } catch (error) {
            //   console.error("Error playing notification sound:", error);
            // }
          }

          // Reset the userSentMessage flag after processing
          userSentMessageRef.current = false;

          const updatedMessages = [
            ...prevMessages,
            ...newMessages.map((msg) => {
              const processedMsg = processMessage(msg);
              return processedMsg;
            })
          ];
          // Update latest message id
          if (updatedMessages.length > 0) {
            latestMessageIdRef.current =
              updatedMessages[updatedMessages.length - 1].id;
          }
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [auth?.token, open]);

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

  useEffect(() => {
    // Reset hasNewMessages when the chat popover is opened
    if (open) {
      setHasNewMessages(false);
    }
  }, [open]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // Set the flag to indicate user sent a message
      userSentMessageRef.current = true;
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
        //console.log("Raw new user message:", message);
        const newUserMessage = processMessage({
          id: new Date().getTime().toString(),
          text: message
        });
        // console.log(
        //   "Processed new user message:",
        //   JSON.stringify(newUserMessage)
        // );
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative [&_svg]:size-6 bg-transparent"
          >
            <MessageCircleQuestion className="text-gray-hint_text stroke-1" />
            {hasNewMessages && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-2 w-2 p-0"
              />
            )}
            <span className="sr-only">Support Chat</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="p-0 px-0 pt-0">
              <div className="flex justify-center items-center border-b p-4 text-center">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-semibold">Support Chat</h3>
                  <p className="text-gray-500 text-sm">Ask us anything</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-0">
              <ScrollArea className="h-[350px] px-4">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={cn(
                      "w-full flex mb-2",
                      msg.isUserMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] px-3 py-2 rounded-2xl text-sm",
                        msg.isUserMessage
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-black"
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t">
              <form
                className="flex w-full h-9"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <Input
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 rounded-r-none h-full focus-visible:ring-0"
                />
                <Button type="submit" size="icon" className="rounded-l-none">
                  <Send />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SupportChat;
