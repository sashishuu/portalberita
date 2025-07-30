import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  TagIcon,
  FireIcon,
  ClockIcon,
  UserCircleIcon,
  PlusIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

const MobileMenu = ({ isAuthenticated, user, categories, onClose, onLogout }) => {
  const location = useLocation();

  const menuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
    },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const navigationItems = [
    { label: 'Beranda', href: '/', icon: HomeIcon },
    { label: 'Populer', href: '/popular', icon: FireIcon },
    { label: 'Terbaru', href: '/latest', icon: ClockIcon },
  ];

  const userMenuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: UserCircleIcon },
    { label: 'Profil Saya', href: '/profile', icon: UserCircleIcon },
    { label: 'Artikel Saya', href: '/my-articles', icon: BookmarkIcon },
    { label: 'Bookmark', href: '/bookmarks', icon: BookmarkIcon },
    { label: 'Pengaturan', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <motion.div
      variants={menuVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="md:hidden bg-white border-t border-secondary-200 shadow-lg"
    >
      <div className="container-custom py-4 space-y-6">
        {/* Navigation Links */}
        <motion.div className="space-y-2">
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.href}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-secondary-700 hover:bg-secondary-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Categories */}
        <motion.div className="space-y-2">
          <motion.h3
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="px-4 text-sm font-semibold text-secondary-500 uppercase tracking-wider"
          >
            Kategori
          </motion.h3>
          
          {categories.slice(0, 5).map((category, index) => (
            <motion.div
              key={category._id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link
                to={`/category/${category.slug}`}
                onClick={onClose}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-secondary-700 hover:bg-secondary-50 transition-colors"
              >
                <TagIcon className="w-4 h-4" />
                <span>{category.name}</span>
              </Link>
            </motion.div>
          ))}
          
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.9 }}
          >
            <Link
              to="/categories"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <TagIcon className="w-4 h-4" />
              <span>Lihat Semua Kategori</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* User Section */}
        {isAuthenticated ? (
          <motion.div className="space-y-2 border-t border-secondary-200 pt-4">
            {/* User Info */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.0 }}
              className="flex items-center space-x-3 px-4 py-2"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-primary-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-secondary-900">{user?.name}</p>
                <p className="text-sm text-secondary-500">{user?.email}</p>
              </div>
            </motion.div>

            {/* Create Article Button */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.1 }}
            >
              <Link
                to="/create-article"
                onClick={onClose}
                className="flex items-center space-x-3 mx-4 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="font-medium">Tulis Artikel</span>
              </Link>
            </motion.div>

            {/* User Menu Items */}
            {userMenuItems.map((item, index) => (
              <motion.div
                key={item.href}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 1.2 + index * 0.1 }}
              >
                <Link
                  to={item.href}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-700 hover:bg-secondary-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            ))}

            {/* Admin Link */}
            {user?.role === 'admin' && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 1.7 }}
              >
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>
              </motion.div>
            )}

            {/* Logout Button */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.8 }}
            >
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-accent-600 hover:bg-accent-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div className="space-y-2 border-t border-secondary-200 pt-4">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.0 }}
            >
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-secondary-700 hover:bg-secondary-50 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span>Masuk</span>
              </Link>
            </motion.div>
            
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.1 }}
            >
              <Link
                to="/register"
                onClick={onClose}
                className="flex items-center space-x-3 mx-4 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <UserPlusIcon className="w-5 h-5" />
                <span className="font-medium">Daftar</span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MobileMenu;