import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  UserIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

import { register as registerUser, clearError } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Validation schema
const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(50, 'Nama maksimal 50 karakter')
    .required('Nama wajib diisi'),
  email: yup
    .string()
    .email('Format email tidak valid')
    .required('Email wajib diisi'),
  password: yup
    .string()
    .min(6, 'Password minimal 6 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password harus mengandung huruf besar, huruf kecil, dan angka')
    .required('Password wajib diisi'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
  terms: yup
    .boolean()
    .oneOf([true], 'Anda harus menyetujui syarat dan ketentuan'),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error, registrationSuccess } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const password = watch('password');

  useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (registrationSuccess) {
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  }, [registrationSuccess, navigate]);

  const onSubmit = async (data) => {
    const { confirmPassword, terms, ...userData } = data;
    try {
      await dispatch(registerUser(userData)).unwrap();
    } catch (error) {
      // Error already handled in slice
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 3) return { strength: 1, label: 'Lemah', color: 'bg-accent-500' };
    if (score < 5) return { strength: 2, label: 'Sedang', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Kuat', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

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

  if (registrationSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Registrasi Berhasil!
          </h1>
          <p className="text-secondary-600 mb-6">
            Silakan cek email Anda untuk melakukan verifikasi akun. Anda akan diarahkan ke halaman login dalam beberapa detik.
          </p>
          <Link
            to="/login"
            className="btn-primary"
          >
            Ke Halaman Login
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Daftar - Portal Berita</title>
        <meta name="description" content="Daftar akun baru di Portal Berita untuk mulai membaca dan menulis artikel terbaru." />
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
              Bergabung dengan Kami
            </h1>
            <p className="text-secondary-600">
              Buat akun untuk mulai membaca dan menulis berita
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="form-label">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className={`form-input pl-10 ${errors.name ? 'border-accent-500 focus:ring-accent-500' : ''}`}
                  placeholder="Masukkan nama lengkap Anda"
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

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
                  placeholder="Buat password yang kuat"
                  autoComplete="new-password"
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-secondary-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-secondary-600">
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className={`form-input pl-10 pr-10 ${errors.confirmPassword ? 'border-accent-500 focus:ring-accent-500' : ''}`}
                  placeholder="Ulangi password Anda"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div>
              <div className="flex items-start">
                <input
                  {...register('terms')}
                  id="terms"
                  type="checkbox"
                  className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded mt-1 ${errors.terms ? 'border-accent-500' : ''}`}
                />
                <label htmlFor="terms" className="ml-3 text-sm text-secondary-700">
                  Saya menyetujui{' '}
                  <Link
                    to="/terms"
                    className="text-primary-600 hover:text-primary-700"
                    target="_blank"
                  >
                    Syarat dan Ketentuan
                  </Link>{' '}
                  serta{' '}
                  <Link
                    to="/privacy"
                    className="text-primary-600 hover:text-primary-700"
                    target="_blank"
                  >
                    Kebijakan Privasi
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="form-error">{errors.terms.message}</p>
              )}
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
                  <span>Daftar Sekarang</span>
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

          {/* Login Link */}
          <div className="text-center">
            <p className="text-secondary-600">
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default RegisterPage;