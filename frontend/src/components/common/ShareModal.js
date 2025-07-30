import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  XMarkIcon,
  ShareIcon,
  LinkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  LinkedinIcon,
} from 'react-share';

const ShareModal = ({ isOpen, onClose, article, url }) => {
  const [copied, setCopied] = useState(false);

  const shareTitle = article?.title || 'Portal Berita';
  const shareDescription = article?.excerpt || 'Baca artikel menarik di Portal Berita';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Link berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareButtons = [
    {
      Component: FacebookShareButton,
      Icon: FacebookIcon,
      label: 'Facebook',
      props: { url, quote: shareTitle },
    },
    {
      Component: TwitterShareButton,
      Icon: TwitterIcon,
      label: 'Twitter',
      props: { url, title: shareTitle },
    },
    {
      Component: WhatsappShareButton,
      Icon: WhatsappIcon,
      label: 'WhatsApp',
      props: { url, title: shareTitle, separator: ' - ' },
    },
    {
      Component: TelegramShareButton,
      Icon: TelegramIcon,
      label: 'Telegram',
      props: { url, title: shareTitle },
    },
    {
      Component: LinkedinShareButton,
      Icon: LinkedinIcon,
      label: 'LinkedIn',
      props: { url, title: shareTitle, summary: shareDescription },
    },
  ];

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
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2 }
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
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
              <div className="flex items-center space-x-2">
                <ShareIcon className="w-6 h-6 text-primary-600" />
                <h2 className="text-lg font-bold text-secondary-900">
                  Bagikan Artikel
                </h2>
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
            <div className="p-6 space-y-6">
              {/* Article Preview */}
              {article && (
                <div className="flex space-x-3 p-3 bg-secondary-50 rounded-lg">
                  {article.image && (
                    <img
                      src={article.image.startsWith('http') 
                        ? article.image 
                        : `${process.env.REACT_APP_API_URL}/${article.image}`
                      }
                      alt={article.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-secondary-900 text-sm line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-secondary-500 mt-1">
                      {article.author?.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Social Share Buttons */}
              <div>
                <h3 className="text-sm font-medium text-secondary-700 mb-3">
                  Bagikan ke media sosial
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {shareButtons.map(({ Component, Icon, label, props }) => (
                    <motion.div
                      key={label}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="text-center"
                    >
                      <Component
                        {...props}
                        className="w-full flex justify-center"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden hover:scale-110 transition-transform">
                          <Icon size={48} round />
                        </div>
                      </Component>
                      <span className="text-xs text-secondary-600 mt-1 block">
                        {label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Copy Link */}
              <div>
                <h3 className="text-sm font-medium text-secondary-700 mb-3">
                  Atau salin link
                </h3>
                <div className="flex space-x-2">
                  <div className="flex-1 px-3 py-2 bg-secondary-50 rounded-lg border border-secondary-200">
                    <p className="text-sm text-secondary-600 truncate">
                      {url}
                    </p>
                  </div>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {copied ? (
                      <div className="flex items-center space-x-1">
                        <CheckIcon className="w-4 h-4" />
                        <span>Tersalin</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <LinkIcon className="w-4 h-4" />
                        <span>Salin</span>
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;