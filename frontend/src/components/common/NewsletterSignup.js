import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

import LoadingSpinner from './LoadingSpinner';

// Validation schema
const newsletterSchema = yup.object({
  email: yup
    .string()
    .email('Format email tidak valid')
    .required('Email wajib diisi'),
});

const NewsletterSignup = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(newsletterSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Replace with actual newsletter subscription API
      console.log('Newsletter subscription:', data);
      
      setIsSubmitted(true);
      toast.success('Berhasil berlangganan newsletter!');
      reset();
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
      
    } catch (error) {
      toast.error('Gagal berlangganan newsletter');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16" />
      </div>

      <div className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Jangan Lewatkan Berita Terbaru
                </h2>
                <p className="text-xl text-primary-100 leading-relaxed">
                  Dapatkan ringkasan berita terpilih langsung di kotak masuk Anda. 
                  Gratis dan tanpa spam!
                </p>
              </motion.div>

              {/* Newsletter Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-md mx-auto"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-white/70" />
                      </div>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                        placeholder="Masukkan email Anda"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-primary-200 text-sm mt-1 text-left">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <LoadingSpinner size="small" color="primary" />
                    ) : (
                      <>
                        <span>Berlangganan</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>

                <p className="text-primary-200 text-sm mt-4">
                  Dengan berlangganan, Anda menyetujui{' '}
                  <a href="/privacy" className="underline hover:no-underline">
                    Kebijakan Privasi
                  </a>{' '}
                  kami
                </p>
              </motion.form>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <EnvelopeIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Berita Pilihan</h3>
                  <p className="text-sm text-primary-200">
                    Ringkasan berita terpenting setiap hari
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Tanpa Spam</h3>
                  <p className="text-sm text-primary-200">
                    Hanya konten berkualitas, tanpa email sampah
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ArrowRightIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Mudah Berhenti</h3>
                  <p className="text-sm text-primary-200">
                    Berhenti berlangganan kapan saja dengan satu klik
                  </p>
                </div>
              </motion.div>
            </>
          ) : (
            /* Success State */
            <motion.div
              variants={successVariants}
              initial="hidden"
              animate="visible"
              className="py-8"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Berlangganan Berhasil!
              </h2>
              <p className="text-xl text-primary-100">
                Terima kasih! Kami akan mengirimkan berita terbaru ke email Anda.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default NewsletterSignup;