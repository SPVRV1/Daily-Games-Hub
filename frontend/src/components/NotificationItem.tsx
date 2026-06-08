import { Notification } from '../types/notification.types';
import { UserPlus, Gamepad2, Trophy, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onRead,
  onDelete,
}: NotificationItemProps) {
    const navigate = useNavigate();
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
      }
      console.log('Notification clicked:', notification.actionUrl);
      
      
      if (notification.actionUrl) {
          navigate(notification.actionUrl);
      }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'friend_request':
        return <UserPlus size={18} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />;
      case 'game_played':
        return <Gamepad2 size={18} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />;
      case 'new_record':
        return <Trophy size={18} className="flex-shrink-0" style={{ color: 'var(--orange)' }} />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={handleClick}
      className={`px-4 py-3 border-b cursor-pointer transition-colors last:border-b-0 ${
        notification.read
          ? 'hover:bg-opacity-50'
          : 'font-semibold hover:bg-opacity-75'
      }`}
      style={{
        borderBottomColor: 'var(--border)',
        backgroundColor: notification.read ? 'transparent' : 'rgba(51, 119, 242, 0.05)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm leading-relaxed break-words"
            style={{ color: 'var(--text-dark)' }}
          >
            {notification.message}
          </p>
          <span className="text-xs" style={{ color: 'var(--text)' }}>
            {formatTime(notification.timestamp)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Delete notification"
        >
          <X size={16} style={{ color: 'var(--text)' }} />
        </button>
      </div>
    </div>
  );
}
