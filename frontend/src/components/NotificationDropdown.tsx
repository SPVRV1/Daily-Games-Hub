import { useRef, useEffect, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../context/ThemeContext';
import NotificationItem from './NotificationItem';
import { Check, Trash2 } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const { notifications, markAsRead, deleteNotification, clearAll, markAllAsRead } = useNotifications();
  const { isDark } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [displayedNotifications] = useState(5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayedNotifs = notifications.slice(0, displayedNotifications);
  const hasMoreNotifications = notifications.length > displayedNotifications;

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 top-full mt-2 w-80 rounded-lg shadow-lg border z-50 overflow-hidden transition-opacity duration-150 ${
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{
          borderBottomColor: 'var(--border)',
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-dark)' }}>
          Notifications
        </h3>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Mark all as read"
              title="Mark all as read"
            >
              <Check size={16} style={{ color: 'var(--primary)' }} />
            </button>
            <button
              onClick={clearAll}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Clear all"
              title="Clear all"
            >
              <Trash2 size={16} style={{ color: 'var(--text)' }} />
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text)' }}>
              No notifications yet
            </p>
          </div>
        ) : (
          <>
            {displayedNotifs.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      {(hasMoreNotifications || notifications.length > 0) && (
        <div
          className="px-4 py-3 text-center border-t"
          style={{
            borderTopColor: 'var(--border)',
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          {hasMoreNotifications ? (
            <button
              className="text-sm font-medium transition-colors"
              style={{
                color: 'var(--primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              View all notifications
            </button>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text)' }}>
              All caught up!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
