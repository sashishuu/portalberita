import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

import { login, clearError } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Format email tidak valid')
    .required('Email wajib diisi'),
  password: yup
    .string()
    .min(6, 'Password minimal 6 karakter')
    .required('Password wajib diisi'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      await dispatch(login(data)).unwrap();
      toast.success('Login berhasil!');
      navigate(from, { replace: true });
    } catch (error) {
      // Error already handled in slice
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

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, delay: 0.2 },
    },
  };

  return (
    <>
      <Helmet>
        <title>Masuk - Portal Berita</title>
        <meta name="description" content="Masuk ke akun Portal Berita Anda untuk membaca dan menulis artikel terbaru." />
      </Helmet>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md mx-auto"
      >
        <motion.div
          variants={formVariants}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">PB</span>
              </div>
              <span className="text-2xl font-bold text-gradient">Portal Berita</span>
            </Link>
            
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Selamat Datang Kembali
            </h1>
            <p className="text-secondary-600">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className={`form-input pl-10 ${errors.email ? 'border-accent-500 focus:ring-accent-500' : ''}`}
                  placeholder="Masukkan email Anda"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`form-input pl-10 pr-10 ${errors.password ? 'border-accent-500 focus:ring-accent-500' : ''}`}
                  placeholder="Masukkan password Anda"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                  Ingat saya
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Lupa password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary btn-lg relative"
            >
              {loading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-secondary-500">atau</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-secondary-600">
              Belum punya akun?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default LoginPage;