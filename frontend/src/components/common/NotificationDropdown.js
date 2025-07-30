import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  BellIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  UserPlusIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import LoadingSpinner from './LoadingSpinner';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'comment':
        return ChatBubbleLeftIcon;
      case 'like':
        return HeartIcon;
      case 'follow':
        return UserPlusIcon;
      case 'article':
        return DocumentTextIcon;
      default:
        return BellIcon;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'comment':
        return 'text-blue-500';
      case 'like':
        return 'text-red-500';
      case 'follow':
        return 'text-green-500';
      case 'article':
        return 'text-purple-500';
      default:
        return 'text-secondary-500';
    }
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: id 
    });
  };

  const Icon = getIcon(notification.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-start space-x-3 p-4 hover:bg-secondary-50 transition-colors ${
        !notification.read ? 'bg-primary-50/50' : ''
      }`}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center flex-shrink-0 ${
        !notification.read ? 'border-primary-300' : 'border-secondary-200'
      }`}>
        <Icon className={`w-4 h-4 ${getIconColor(notification.type)}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${!notification.read ? 'font-medium' : ''} text-secondary-900`}>
              {notification.message}
            </p>
            <p className="text-xs text-secondary-500 mt-1">
              {formatDate(notification.createdAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-2">
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification._id)}
                className="p-1 text-secondary-400 hover:text-primary-600 rounded transition-colors"
                title="Tandai sebagai dibaca"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(notification._id)}
              className="p-1 text-secondary-400 hover:text-red-600 rounded transition-colors"
              title="Hapus notifikasi"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Link to related content */}
        {notification.link && (
          <Link
            to={notification.link}
            className="inline-block mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Lihat detail
          </Link>
        )}
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
      )}
    </motion.div>
  );
};

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockNotifications = [
        {
          _id: '1',
          type: 'comment',
          message: 'John Doe berkomentar pada artikel "Teknologi AI Terbaru"',
          createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false,
          link: '/article/teknologi-ai-terbaru',
        },
        {
          _id: '2',
          type: 'like',
          message: 'Sarah menyukai artikel Anda "Tips Menulis Efektif"',
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          read: false,
          link: '/article/tips-menulis-efektif',
        },
        {
          _id: '3',
          type: 'follow',
          message: 'Ahmad mulai mengikuti Anda',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: true,
          link: '/profile/ahmad',
        },
        {
          _id: '4',
          type: 'article',
          message: 'Artikel Anda "Panduan React" telah dipublikasi',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: true,
          link: '/article/panduan-react',
        },
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
      setLoading(false);
    }, 1000);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification._id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(notification => notification._id !== id));
    const notification = notifications.find(n => n._id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="w-80 bg-white border border-secondary-200 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-secondary-50">
        <div className="flex items-center space-x-2">
          <BellIcon className="w-5 h-5 text-secondary-600" />
          <h3 className="font-semibold text-secondary-900">Notifikasi</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Tandai semua
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="text-xs text-secondary-500 hover:text-secondary-700"
            >
              Hapus semua
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="small" text="Memuat notifikasi..." />
          </div>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <BellIcon className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
            <h4 className="font-medium text-secondary-900 mb-1">
              Tidak ada notifikasi
            </h4>
            <p className="text-sm text-secondary-500">
              Notifikasi baru akan muncul di sini
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-secondary-200 bg-secondary-50">
          <Link
            to="/notifications"
            className="block w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Lihat semua notifikasi
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;