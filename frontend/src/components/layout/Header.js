import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon,
  ChevronDownIcon,
  PlusIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

import { logout } from '../../store/slices/authSlice';
import SearchModal from '../common/SearchModal';
import NotificationDropdown from '../common/NotificationDropdown';
import MobileMenu from './MobileMenu';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { categories } = useSelector((state) => state.category);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const userMenuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: UserCircleIcon,
    },
    {
      label: 'Profil Saya',
      href: '/profile',
      icon: UserCircleIcon,
    },
    {
      label: 'Artikel Saya',
      href: '/my-articles',
      icon: BookmarkIcon,
    },
    {
      label: 'Bookmark',
      href: '/bookmarks',
      icon: BookmarkIcon,
    },
    {
      label: 'Pengaturan',
      href: '/settings',
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-secondary-200 shadow-sm">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center"
                >
                  <span className="text-white font-bold text-sm">PB</span>
                </motion.div>
                <span className="text-xl font-bold text-gradient">Portal Berita</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'text-primary-600'
                    : 'text-secondary-600 hover:text-primary-600'
                }`}
              >
                Beranda
              </Link>
              
              {/* Categories dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-1 text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors">
                  <span>Kategori</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-secondary-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    {categories.slice(0, 6).map((category) => (
                      <Link
                        key={category._id}
                        to={`/category/${category.slug}`}
                        className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                    <div className="border-t border-secondary-200 mt-2 pt-2">
                      <Link
                        to="/categories"
                        className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        Lihat Semua Kategori
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/popular"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/popular'
                    ? 'text-primary-600'
                    : 'text-secondary-600 hover:text-primary-600'
                }`}
              >
                Populer
              </Link>
              
              <Link
                to="/latest"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/latest'
                    ? 'text-primary-600'
                    : 'text-secondary-600 hover:text-primary-600'
                }`}
              >
                Terbaru
              </Link>
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-all duration-200"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </motion.button>

              {isAuthenticated ? (
                <>
                  {/* Create Article Button */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/create-article"
                      className="hidden sm:flex items-center space-x-2 btn-primary btn-sm"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Tulis</span>
                    </Link>
                  </motion.div>

                  {/* Notifications */}
                  <div className="relative" ref={notificationRef}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="relative p-2 text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-all duration-200"
                    >
                      <BellIcon className="w-5 h-5" />
                      {/* Notification badge */}
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
                    </motion.button>

                    <AnimatePresence>
                      {isNotificationOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-80"
                        >
                          <NotificationDropdown />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-2 text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-all duration-200"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-6 h-6" />
                      )}
                      <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                      <ChevronDownIcon className="w-4 h-4" />
                    </motion.button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white border border-secondary-200 rounded-lg shadow-lg py-2"
                        >
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                          
                          {user?.role === 'admin' && (
                            <>
                              <div className="border-t border-secondary-200 my-2"></div>
                              <Link
                                to="/admin"
                                className="flex items-center space-x-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Cog6ToothIcon className="w-4 h-4" />
                                <span>Admin Panel</span>
                              </Link>
                            </>
                          )}
                          
                          <div className="border-t border-secondary-200 my-2"></div>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-accent-600 hover:bg-accent-50 transition-colors"
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               </>
             ) : (
               <>
                 {/* Login/Register buttons */}
                 <div className="hidden sm:flex items-center space-x-3">
                   <Link
                     to="/login"
                     className="btn-ghost btn-sm"
                   >
                     Masuk
                   </Link>
                   <Link
                     to="/register"
                     className="btn-primary btn-sm"
                   >
                     Daftar
                   </Link>
                 </div>
               </>
             )}

             {/* Mobile Menu Button */}
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="md:hidden p-2 text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-all duration-200"
             >
               {isMobileMenuOpen ? (
                 <XMarkIcon className="w-5 h-5" />
               ) : (
                 <Bars3Icon className="w-5 h-5" />
               )}
             </motion.button>
           </div>
         </div>
       </div>

       {/* Mobile Menu */}
       <AnimatePresence>
         {isMobileMenuOpen && (
           <MobileMenu
             isAuthenticated={isAuthenticated}
             user={user}
             categories={categories}
             onClose={() => setIsMobileMenuOpen(false)}
             onLogout={handleLogout}
           />
         )}
       </AnimatePresence>
     </header>

     {/* Search Modal */}
     <SearchModal
       isOpen={isSearchOpen}
       onClose={() => setIsSearchOpen(false)}
       onSearch={handleSearch}
     />
   </>
 );
};

export default Header;