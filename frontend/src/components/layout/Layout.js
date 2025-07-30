import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Pages that don't need sidebar
  const noSidebarPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
  const showSidebar = !noSidebarPages.some(page => location.pathname.startsWith(page));
  
  // Admin pages have different layout
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // Auth pages have minimal layout
  const isAuthPage = noSidebarPages.some(page => location.pathname.startsWith(page));

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        >
          {children}
        </motion.main>
      </div>
    );
  }

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <motion.main
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 ml-64 p-8"
          >
            {children}
          </motion.main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {showSidebar && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block lg:w-80 xl:w-96 bg-secondary-50 border-r border-secondary-200"
          >
            <Sidebar />
          </motion.aside>
        )}
        
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex-1 ${showSidebar ? 'max-w-4xl' : 'max-w-full'} mx-auto`}
        >
          {children}
        </motion.main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;