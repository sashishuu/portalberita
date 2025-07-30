import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  confirmButtonClass = 'btn-primary',
  loading = false,
}) => {
  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={contentVariants}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-lg font-bold text-secondary-900">{title}</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-secondary-400 hover:text-secondary-600 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-secondary-700 leading-relaxed">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-200 bg-secondary-50">
              <button
                onClick={onClose}
                disabled={loading}
                className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={loading}
                className={`${confirmButtonClass} disabled:opacity-50 disabled:cursor-not-allowed relative`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;