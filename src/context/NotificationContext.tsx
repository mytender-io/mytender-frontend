// Create a new file: src/context/NotificationContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

interface NotificationContextType {
  unreadCount: number;
  triggerNotification: () => void;
  markAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const triggerNotification = () => {
    setUnreadCount((prev) => prev + 1);
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{ unreadCount, triggerNotification, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
