import React, { useState, useEffect, useCallback } from "react";

/**
 * TabNotification - A component to manage browser tab notifications
 *
 * @param {Object} props
 * @param {number} props.unreadCount - Number of unread messages/notifications
 * @param {string} props.baseTitle - The base title of the application
 * @param {string} props.notificationPrefix - Prefix to show before the count (default: "(")
 * @param {string} props.notificationSuffix - Suffix to show after the count (default: ")")
 * @param {boolean} props.blinkTitle - Whether to blink the title (default: true)
 * @param {number} props.blinkInterval - Interval for title blinking in ms (default: 1000)
 * @param {string} props.faviconUrl - Base favicon URL
 * @param {string} props.notificationFaviconUrl - Notification favicon URL
 * @param {boolean} props.useAsterisk - Whether to add an asterisk before the title (default: false)
 */
const TabNotification = ({
  unreadCount = 0,
  baseTitle = "mytender.io",
  notificationPrefix = "(",
  notificationSuffix = ")",
  blinkTitle = true,
  blinkInterval = 1000,
  faviconUrl,
  notificationFaviconUrl,
  useAsterisk = false,
  onTabVisible = () => {}
}) => {
  const [documentVisible, setDocumentVisible] = useState(!document.hidden);
  const [blinking, setBlinking] = useState(false);
  const [originalTitle] = useState(document.title || baseTitle);

  // Function to update the page title
  const updateTitle = useCallback(() => {
    if (unreadCount > 0 && !documentVisible) {
      // If useAsterisk is true, add an asterisk before the base title
      const titleWithAsterisk = useAsterisk ? `* ${baseTitle}` : baseTitle;
      document.title = `${notificationPrefix}${unreadCount}${notificationSuffix} ${titleWithAsterisk}`;
    } else {
      document.title = baseTitle;
    }
  }, [
    unreadCount,
    documentVisible,
    baseTitle,
    notificationPrefix,
    notificationSuffix,
    useAsterisk
  ]);

  // Function to update favicon
  const updateFavicon = useCallback(() => {
    if (!faviconUrl || !notificationFaviconUrl) return;

    const linkElements = document.querySelectorAll(
      'link[rel="icon"], link[rel="shortcut icon"]'
    );
    const iconUrl =
      unreadCount > 0 && !documentVisible ? notificationFaviconUrl : faviconUrl;

    if (linkElements.length > 0) {
      // Update existing favicon links
      linkElements.forEach((link) => {
        link.href = iconUrl;
      });
    } else {
      // Create a new favicon link if none exists
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = iconUrl;
      document.head.appendChild(link);
    }
  }, [unreadCount, documentVisible, faviconUrl, notificationFaviconUrl]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setDocumentVisible(isVisible);

      if (isVisible) {
        // Reset title when tab becomes visible
        document.title = baseTitle;
        if (blinking) {
          setBlinking(false);
        }
        onTabVisible();
      } else if (unreadCount > 0) {
        // Start notification when tab becomes hidden
        updateTitle();
        if (blinkTitle && !blinking) {
          setBlinking(true);
        }
      }

      updateFavicon();
    };

    // Register visibility change event
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial update
    updateTitle();
    updateFavicon();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.title = originalTitle; // Restore original title on unmount
    };
  }, [
    updateTitle,
    updateFavicon,
    baseTitle,
    blinkTitle,
    blinking,
    originalTitle,
    unreadCount,
    onTabVisible
  ]);

  // Handle title blinking effect
  useEffect(() => {
    let interval;

    if (blinking && blinkTitle && unreadCount > 0 && !documentVisible) {
      let showNotification = true;

      interval = setInterval(() => {
        if (showNotification) {
          const titleWithAsterisk = useAsterisk ? `* ${baseTitle}` : baseTitle;
          document.title = `${notificationPrefix}${unreadCount}${notificationSuffix} ${titleWithAsterisk}`;
        } else {
          document.title = baseTitle;
        }
        showNotification = !showNotification;
      }, blinkInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    blinking,
    blinkTitle,
    unreadCount,
    documentVisible,
    baseTitle,
    blinkInterval,
    notificationPrefix,
    notificationSuffix,
    useAsterisk
  ]);

  // This component doesn't render anything visible
  return null;
};

export default TabNotification;
