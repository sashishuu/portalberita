import React from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ 
  message = 'Terjadi kesalahan', 
  onRetry = null, 
  showIcon = true,
  variant = 'default'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'text-accent-600 text-sm';
      case 'card':
        return 'bg-accent-50 border border-accent-200 rounded-lg p-4';
      default:
        return 'bg-accent-50 border border-accent-200 rounded-lg p-6';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  if (variant === 'minimal') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={getVariantClasses()}
      >
        {message}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${getVariantClasses()} text-center`}
    >
      {showIcon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-accent-600" />
          </div>
        </motion.div>
      )}

      <h3 className="text-lg font-semibold text-accent-800 mb-2">
        Oops! Ada yang salah
      </h3>
      
      <p className="text-accent-600 mb-4">
        {message}
      </p>

      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="inline-flex items-center space-x-2 btn-outline text-accent-600 border-accent-300 hover:bg-accent-600 hover:text-white"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Coba Lagi</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorMessage;