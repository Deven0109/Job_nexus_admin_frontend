import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../api/notification.api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchInitialData = async () => {
    try {
      const res = await notificationAPI.getMyNotifications({ limit: 10 });
      setNotifications(res.data?.data?.notifications || []);
      
      const countRes = await notificationAPI.getUnreadCount();
      setUnreadCount(countRes.data?.data?.count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchInitialData();

      // Socket setup
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const socketUrl = apiUrl.replace('/api', '');
      
      const socketInstance = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        console.log('[Socket] Connected');
        socketInstance.emit('join', user._id);
        socketInstance.emit('join_role', user.role);
      });

      socketInstance.on('notification:new', (notification) => {
        console.log('[Socket] New notification:', notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        
        // Browser notification
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message
          });
        }
      });

      setSocket(socketInstance);

      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const deletedOne = notifications.find(n => n._id === id);
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (deletedOne && !deletedOne.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const value = {
    socket,
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchInitialData
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
