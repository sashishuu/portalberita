import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', color = 'primary', text = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      default:
        return 'w-8 h-8';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'border-white border-t-transparent';
      case 'secondary':
        return 'border-secondary-300 border-t-secondary-600';
      default:
        return 'border-primary-200 border-t-primary-600';
    }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center space-y-3"
    >
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className={`${getSizeClasses()} border-2 ${getColorClasses()} rounded-full`}
      />
      
      {text && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-secondary-600'} animate-pulse`}>
          {text}
        </p>
      )}
    </motion.div>
  );
};

export default LoadingSpinner;