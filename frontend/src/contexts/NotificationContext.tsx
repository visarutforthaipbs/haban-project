import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { notificationApi, NotificationData } from "../services/api";
import axios from "axios";

// Define notification type
export type Notification = NotificationData;

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  notificationSettings: {
    enableEmailNotifications: boolean;
    email?: string;
  } | null;
  updateNotificationSettings: (settings: {
    enableEmailNotifications: boolean;
    email?: string;
  }) => Promise<void>;
  fetchNotificationSettings: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState<{
    enableEmailNotifications: boolean;
    email?: string;
  } | null>(null);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // If API fails, use mock data for development purposes
      if (process.env.NODE_ENV === "development") {
        const mockNotifications: Notification[] = [
          {
            _id: "1",
            userId: user.id,
            type: "match",
            title: "พบสุนัขที่อาจตรงกับที่คุณกำลังหา",
            message: "พบสุนัขพันธุ์ไทยหลังอาน สีน้ำตาล ที่อำเภอเมือง",
            read: false,
            data: { dogId: "sample-dog-id-1" },
            createdAt: new Date().toISOString(),
          },
          {
            _id: "2",
            userId: user.id,
            type: "status_update",
            title: "สถานะการค้นหาถูกอัพเดท",
            message: 'รายงานสุนัขหายของคุณถูกอัพเดทเป็น "พบเจอแล้ว"',
            read: true,
            data: { dogId: "sample-dog-id-2" },
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          },
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter((n) => !n.read).length);
      }
    }
  };

  const fetchNotificationSettings = async () => {
    if (!user) {
      setNotificationSettings(null);
      return;
    }

    try {
      const settings = await notificationApi.getSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error("Failed to fetch notification settings:", error);

      // Only set default settings if it's clearly an authentication error
      // or if the API response doesn't indicate a server error
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Authentication error - just set to null
        setNotificationSettings(null);
        // Let the component handle this case
        throw new Error("Authentication required");
      } else {
        // Other error - set default settings
        setNotificationSettings({
          enableEmailNotifications: false,
          email: user.email,
        });
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchNotificationSettings();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationSettings(null);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const updateNotificationSettings = async (settings: {
    enableEmailNotifications: boolean;
    email?: string;
  }) => {
    try {
      await notificationApi.updateSettings(settings);
      setNotificationSettings(settings);
    } catch (error) {
      console.error("Failed to update notification settings:", error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    notificationSettings,
    updateNotificationSettings,
    fetchNotificationSettings,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
