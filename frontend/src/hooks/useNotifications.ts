import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { NotificationContextType } from '../types/notification.types';

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
