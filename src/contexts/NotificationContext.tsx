import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onMessage, isSupported } from 'firebase/messaging';
import { messaging, requestFCMToken } from '../firebase/config';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  fcmToken: string | null;
  notificationPermissionStatus: string;
  requestPermission: () => Promise<void>;
  lastNotification: any | null;
  refreshToken: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<string>('default');
  const [lastNotification, setLastNotification] = useState<any | null>(null);
  const { currentUser } = useAuth();

  // Check if browser supports notifications
  const checkSupport = async () => {
    try {
      return await isSupported();
    } catch (err) {
      console.error('Firebase messaging not supported', err);
      return false;
    }
  };

  // Request notification permission and get FCM token
  const requestPermission = async () => {
    try {
      const isMessagingSupported = await checkSupport();
      if (!isMessagingSupported) {
        setNotificationPermissionStatus('unsupported');
        return;
      }

      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      setNotificationPermissionStatus(permission);

      if (permission === 'granted') {
        const token = await requestFCMToken();
        if (token) {
          setFcmToken(token);
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Manually refresh token
  const refreshToken = async () => {
    try {
      console.log('Manually refreshing FCM token...');
      const token = await requestFCMToken();
      if (token) {
        setFcmToken(token);
        console.log('FCM token refreshed successfully:', token);
      } else {
        console.log('Failed to refresh FCM token');
      }
    } catch (error) {
      console.error('Error refreshing FCM token:', error);
    }
  };

  // Set up message listener and check permission on mount
  useEffect(() => {
    const setupNotifications = async () => {
      // Check if messaging is supported
      const isMessagingSupported = await checkSupport();
      if (!isMessagingSupported || !messaging) {
        console.log('Firebase messaging not supported in this environment');
        return;
      }

      // Check current permission status
      const currentPermission = Notification.permission;
      console.log('Current notification permission:', currentPermission);
      setNotificationPermissionStatus(currentPermission);

      // If permission is granted, get token
      if (currentPermission === 'granted') {
        console.log('Permission already granted, getting token...');
        const token = await requestFCMToken();
        if (token) {
          setFcmToken(token);
        }
      }

      // Listen for messages when the app is in the foreground
      if (messaging) {
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log('Message received in foreground:', payload);
          setLastNotification(payload);
          
          // Display a notification
          if (payload.notification) {
            const { title, body } = payload.notification;
            new Notification(title || 'New Order', {
              body: body || 'You have received a new order',
            });
          }
        });

        return () => {
          unsubscribe();
        };
      }
    };

    if (currentUser) {
      setupNotifications();
    }
  }, [currentUser]);

  const value = {
    fcmToken,
    notificationPermissionStatus,
    requestPermission,
    lastNotification,
    refreshToken
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
