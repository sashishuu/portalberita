import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  LinkedinIcon,
} from '../icons/SocialIcons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Kontak', href: '/contact' },
    { label: 'Kebijakan Privasi', href: '/privacy' },
    { label: 'Syarat & Ketentuan', href: '/terms' },
    { label: 'FAQ', href: '/faq' },
  ];

  const categories = [
    { label: 'Politik', href: '/category/politik' },
    { label: 'Ekonomi', href: '/category/ekonomi' },
    { label: 'Teknologi', href: '/category/teknologi' },
    { label: 'Olahraga', href: '/category/olahraga' },
    { label: 'Hiburan', href: '/category/hiburan' },
  ];

  const socialLinks = [
    { icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook' },
    { icon: TwitterIcon, href: 'https://twitter.com', label: 'Twitter' },
    { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
    { icon: YoutubeIcon, href: 'https://youtube.com', label: 'YouTube' },
    { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PB</span>
              </div>
              <span className="text-xl font-bold">Portal Berita</span>
            </Link>
            
            <p className="text-secondary-300 mb-6 leading-relaxed">
              Platform berita terpercaya yang menyajikan informasi terkini, akurat, dan berimbang dari berbagai bidang untuk masyarakat Indonesia.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-primary-400" />
                <span className="text-secondary-300">info@portalberita.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-primary-400" />
                <span className="text-secondary-300">+62 21 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-primary-400" />
                <span className="text-secondary-300">Jakarta, Indonesia</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Kategori</h3>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.href}>
                  <Link
                    to={category.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">Ikuti Kami</h3>
            <p className="text-secondary-300 mb-4">
              Dapatkan update berita terbaru langsung di email Anda.
            </p>

            {/* Newsletter Signup */}
            <div className="mb-6">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="flex-1 px-3 py-2 bg-secondary-800 border border-secondary-700 rounded-l-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors duration-200">
                  Daftar
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center text-secondary-400 hover:text-primary-400 hover:bg-secondary-700 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-secondary-800 pt-8 mt-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-secondary-400 text-sm">
              © {currentYear} Portal Berita. Seluruh hak cipta dilindungi.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link
                to="/privacy"
                className="text-secondary-400 hover:text-primary-400 transition-colors duration-200"
              >
                Kebijakan Privasi
              </Link>
              <Link
                to="/terms"
                className="text-secondary-400 hover:text-primary-400 transition-colors duration-200"
              >
                Syarat Layanan
              </Link>
              <Link
                to="/sitemap"
                className="text-secondary-400 hover:text-primary-400 transition-colors duration-200"
              >
                Peta Situs
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;