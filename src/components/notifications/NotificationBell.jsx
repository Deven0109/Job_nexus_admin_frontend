import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineClock, HiOutlineXMark } from 'react-icons/hi2';
import { useNotifications } from '../../context/NotificationContext';
import { notificationAPI } from '../../api/notification.api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { 
        notifications, 
        setNotifications, 
        unreadCount, 
        setUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications
    } = useNotifications();

    useEffect(() => {
        // Close dropdown on click outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/notifications');
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.isRead) {
                await markAsRead(notification._id);
            }
            setIsOpen(false);
            setIsExpanded(false);
            if (notification.route) {
                navigate(notification.route);
            }
        } catch (error) {
            console.error('Error handling notification click', error);
        }
    };

    const handleRemove = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            toast.success('Notification removed');
        } catch (error) {
            toast.error('Failed to remove notification');
        }
    };

    const onMarkAllRead = async () => {
        try {
            await markAllAsRead();
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) {
                        setIsExpanded(false);
                        refreshNotifications();
                    }
                }}
                className={`p-2.5 rounded-xl transition-all relative ${
                    isOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
                aria-label="Notifications"
            >
                <HiOutlineBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-1 ring-red-100/50">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 z-[100] overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-white">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={onMarkAllRead}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                            >
                                <HiOutlineCheckCircle className="w-4 h-4" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`px-5 py-4 cursor-pointer hover:bg-slate-50 transition-all flex gap-4 ${
                                            !notification.isRead ? 'bg-blue-50/20' : ''
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                                            !notification.isRead 
                                                ? 'bg-blue-100 text-blue-600 border-blue-200' 
                                                : 'bg-slate-50 text-slate-400 border-slate-100'
                                        }`}>
                                            <HiOutlineBell className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <p className={`text-[13px] leading-tight font-bold text-slate-900`}>
                                                    {notification.title}
                                                </p>
                                                <button
                                                    onClick={(e) => handleRemove(e, notification._id)}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-2 border border-transparent hover:border-red-100 flex-shrink-0"
                                                    title="Remove"
                                                >
                                                    <HiOutlineXMark className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[12px] text-slate-600 leading-relaxed font-medium mb-2 pr-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                                                    <HiOutlineClock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                                {!notification.isRead && (
                                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <HiOutlineBell className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-sm font-bold">No notifications yet</p>
                                <p className="text-xs mt-1">We'll notify you when something happens</p>
                            </div>
                        )}
                    </div>

                    {!isExpanded && notifications.length >= 5 && (
                        <div className="p-3 border-t border-slate-50 text-center bg-slate-50/30">
                            <button
                                onClick={handleViewAll}
                                className="text-xs font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                    
                    {isExpanded && (
                        <div className="p-3 border-t border-slate-50 text-center bg-slate-50/30">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="text-xs font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider"
                            >
                                Show less
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
