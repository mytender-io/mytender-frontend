import { useNotification } from "../context/NotificationContext";
import TabNotification from "./TabNotification";

const TabNotificationContainer = () => {
  const { unreadCount, markAsRead } = useNotification();

  return (
    <TabNotification
      unreadCount={unreadCount}
      baseTitle="mytender.io"
      blinkTitle={false} // Change to false to stop blinking
      faviconUrl="/images/mytender.io_badge.png"
      notificationFaviconUrl="/images/mytender.io_badge_notification.png"
      useAsterisk={true}
      onTabVisible={markAsRead} // Pass the callback to the TabNotification component
    />
  );
};

export default TabNotificationContainer;
