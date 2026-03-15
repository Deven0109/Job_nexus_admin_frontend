import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HiOutlineBell, 
    HiOutlineCheckCircle, 
    HiOutlineClock, 
    HiOutlineXMark,
    HiOutlineTrash,
    HiOutlineCheck
} from 'react-icons/hi2';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        refreshNotifications,
        setNotifications
    } = useNotifications();
    const [filter, setFilter] = useState('all'); // all, unread

    useEffect(() => {
        refreshNotifications();
    }, []);

    const filteredNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        if (notification.route) {
            navigate(notification.route);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await deleteNotification(id);
        toast.success('Notification removed');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Stay updated with the latest activities on the platform.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-bold transition-all shadow-sm shadow-blue-100/50"
                        >
                            <HiOutlineCheckCircle className="w-5 h-5" />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Content Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Tabs / Filters */}
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`text-sm font-bold pb-4 -mb-4 transition-all relative ${
                            filter === 'all' 
                            ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        All Notifications
                        <span className="ml-2 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">
                            {notifications.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`text-sm font-bold pb-4 -mb-4 transition-all relative ${
                            filter === 'unread' 
                            ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Unread
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                            unreadCount > 0 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {unreadCount}
                        </span>
                    </button>
                </div>

                {/* List */}
                <div className="divide-y divide-slate-50 min-h-[400px]">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`group px-6 py-6 cursor-pointer hover:bg-slate-50/80 transition-all flex gap-5 items-start ${
                                    !notification.isRead ? 'bg-blue-50/10' : ''
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border transition-all ${
                                    !notification.isRead 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                                        : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-white group-hover:text-slate-600'
                                }`}>
                                    <HiOutlineBell className="w-6 h-6" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <h3 className={`text-[15px] font-bold tracking-tight ${
                                            !notification.isRead ? 'text-slate-900' : 'text-slate-600'
                                        }`}>
                                            {notification.title}
                                        </h3>
                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification._id);
                                                    }}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-blue-50"
                                                    title="Mark as read"
                                                >
                                                    <HiOutlineCheck className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(e, notification._id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                title="Remove notification"
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p className={`text-[14px] leading-relaxed mb-3 ${
                                        !notification.isRead ? 'text-slate-800' : 'text-slate-500'
                                    }`}>
                                        {notification.message}
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            <HiOutlineClock className="w-3.5 h-3.5" />
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                        {!notification.isRead && (
                                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]"></span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                <HiOutlineBell className="w-10 h-10 opacity-20" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No notifications found</h3>
                            <p className="text-slate-500 font-medium">
                                {filter === 'unread' 
                                    ? "Perfect! You've caught up with everything."
                                    : "We'll let you know when something important happens."
                                }
                            </p>
                            {filter === 'unread' && notifications.length > 0 && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className="mt-6 text-sm font-bold text-blue-600 hover:underline"
                                >
                                    View all notifications
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
