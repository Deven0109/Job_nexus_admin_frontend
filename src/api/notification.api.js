import api from './axios';

export const notificationAPI = {
    // Get all notifications for current user
    getMyNotifications: (params) => api.get('/notifications', { params }),

    // Get unread count
    getUnreadCount: () => api.get('/notifications/unread-count'),

    // Mark single as read
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),

    // Mark all as read
    markAllAsRead: () => api.patch('/notifications/mark-all-read'),

    // Delete notification
    deleteNotification: (id) => api.delete(`/notifications/${id}`),
};
