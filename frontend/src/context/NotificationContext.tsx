import { createContext, useState, ReactNode } from 'react';
import { Notification, NotificationContextType } from '../types/notification.types';

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'friend_request',
    message: 'Alex sent you a friend request',
    timestamp: new Date(Date.now() - 15 * 60000), // 15 mins ago
    read: false,
    actor: 'Alex',
  },
  {
    id: '2',
    type: 'game_played',
    message: 'Jordan completed Wordle',
    timestamp: new Date(Date.now() - 45 * 60000), // 45 mins ago
    read: false,
    actor: 'Jordan',
  },
  {
    id: '3',
    type: 'new_record',
    message: 'You set a new record in Flagle!',
    timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
    read: true,
  },
  {
    id: '4',
    type: 'game_played',
    message: 'Sam completed Mathsprint',
    timestamp: new Date(Date.now() - 4 * 3600000), // 4 hours ago
    read: true,
    actor: 'Sam',
  },
  {
    id: '5',
    type: 'friend_request',
    message: 'Morgan sent you a friend request',
    timestamp: new Date(Date.now() - 24 * 3600000), // 1 day ago
    read: true,
    actor: 'Morgan',
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
