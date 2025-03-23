import React, { useEffect } from 'react';
import styled from 'styled-components';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationsContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NotificationItem = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease forwards;
  color: white;
  background-color: ${props => {
    switch(props.type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': default: return '#2196f3';
    }
  }};
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const Icon = styled.div`
  font-size: 1.2rem;
`;

const Message = styled.div`
  font-size: 0.9rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
  }
`;

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  removeNotification
}) => {
  useEffect(() => {
    // Set up auto-dismiss timers for notifications
    notifications.forEach(notification => {
      const duration = notification.duration || 3000;
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, duration);
      
      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': default: return 'ℹ️';
    }
  };
  
  return (
    <NotificationsContainer>
      {notifications.map(notification => (
        <NotificationItem key={notification.id} type={notification.type}>
          <NotificationContent>
            <Icon>{getIcon(notification.type)}</Icon>
            <Message>{notification.message}</Message>
          </NotificationContent>
          <CloseButton 
            onClick={() => removeNotification(notification.id)}
            aria-label="Close notification"
          >
            ×
          </CloseButton>
        </NotificationItem>
      ))}
    </NotificationsContainer>
  );
};

export default NotificationSystem; 