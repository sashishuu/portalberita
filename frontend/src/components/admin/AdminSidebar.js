import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  TagIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      href: '/admin',
      exact: true,
    },
    {
      key: 'content',
      label: 'Konten',
      icon: DocumentTextIcon,
      children: [
        { label: 'Artikel', href: '/admin/articles', icon: DocumentTextIcon },
        { label: 'Kategori', href: '/admin/categories', icon: TagIcon },
        { label: 'Komentar', href: '/admin/comments', icon: ChatBubbleLeftIcon },
      ],
    },
    {
      key: 'users',
      label: 'Pengguna',
      icon: UsersIcon,
      children: [
        { label: 'Semua Pengguna', href: '/admin/users', icon: UserGroupIcon },
        { label: 'Moderasi', href: '/admin/moderation', icon: ExclamationTriangleIcon },
      ],
    },
    {
      key: 'analytics',
      label: 'Analitik',
      icon: ChartBarIcon,
      href: '/admin/analytics',
    },
    {
      key: 'notifications',
      label: 'Notifikasi',
      icon: BellIcon,
      href: '/admin/notifications',
    },
    {
      key: 'settings',
      label: 'Pengaturan',
      icon: Cog6ToothIcon,
      href: '/admin/settings',
    },
  ];

  const isActiveLink = (href, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const isActiveParent = (item) => {
    if (item.children) {
      return item.children.some(child => isActiveLink(child.href));
    }
    return false;
  };

  React.useEffect(() => {
    // Auto-expand parent menu if child is active
    menuItems.forEach(item => {
      if (item.children && isActiveParent(item)) {
        setExpandedMenus(prev => ({
          ...prev,
          [item.key]: true
        }));
      }
    });
  }, [location.pathname]);

  const sidebarVariants = {
    hidden: { x: -280 },
    visible: { 
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-secondary-200 shadow-sm z-40 overflow-y-auto"
    >
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-secondary-900">Admin Panel</h2>
          <p className="text-sm text-secondary-600">Kelola portal berita</p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.key}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      isActiveParent(item)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-secondary-700 hover:bg-secondary-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedMenus[item.key] ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedMenus[item.key] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-2 space-y-1 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                              isActiveLink(child.href)
                                ? 'bg-primary-100 text-primary-700 font-medium'
                                : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                            }`}
                          >
                            <child.icon className="w-4 h-4" />
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActiveLink(item.href, item.exact)
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-secondary-700 hover:bg-secondary-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-secondary-200">
          <h3 className="text-sm font-semibold text-secondary-900 mb-3">
            Statistik Cepat
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary-600">Artikel Hari Ini</span>
              <span className="text-sm font-medium text-secondary-900">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary-600">Pengguna Online</span>
              <span className="text-sm font-medium text-green-600">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary-600">Komentar Baru</span>
              <span className="text-sm font-medium text-blue-600">8</span>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;