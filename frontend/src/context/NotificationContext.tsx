import { createContext, useState, useEffect, ReactNode } from 'react';
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

const API_BASE = `${import.meta.env.VITE_API_URL ?? ""}/api`;

function getToken(): string | null {
    return localStorage.getItem('token'); // adjust if you store it differently
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // fetch on mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = getToken();
            if (!token) return;

            const res = await fetch(`${API_BASE}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (data.ok) {
                setNotifications(
                    data.notifications.map((n: any) => ({
                        id: String(n._id),
                        type: n.type,
                        message: n.message,
                        timestamp: new Date(n.created_at),
                        read: n.read,
                        actor: n.actor,
                        actionUrl: n.action_url,
                    }))
                );
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = getToken();
            await fetch(`${API_BASE}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = getToken();
            await fetch(`${API_BASE}/notifications/read-all`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const token = getToken();
            await fetch(`${API_BASE}/notifications/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const clearAll = async () => {
        try {
            const token = getToken();
            await fetch(`${API_BASE}/notifications`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications([]);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAll,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}
