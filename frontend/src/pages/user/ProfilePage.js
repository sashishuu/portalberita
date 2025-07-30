import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import {
  UserIcon,
  CameraIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

import { updateUser, changePassword } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageUpload from '../../components/common/ImageUpload';

// Validation schemas
const profileSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(50, 'Nama maksimal 50 karakter')
    .required('Nama wajib diisi'),
  email: yup
    .string()
    .email('Format email tidak valid')
    .required('Email wajib diisi'),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]*$/, 'Format nomor telepon tidak valid'),
  bio: yup
    .string()
    .max(500, 'Bio maksimal 500 karakter'),
  location: yup
    .string()
    .max(100, 'Lokasi maksimal 100 karakter'),
  website: yup
    .string()
    .url('Format URL tidak valid'),
});

const passwordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Password saat ini wajib diisi'),
  newPassword: yup
    .string()
    .min(6, 'Password baru minimal 6 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password harus mengandung huruf besar, huruf kecil, dan angka')
    .required('Password baru wajib diisi'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('profile');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile form
  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
    },
  });

  // Password form
  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      });
      setAvatarPreview(user.avatar);
    }
  }, [user, profileForm]);

  const handleAvatarChange = (file) => {
    setAvatar(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(user?.avatar || null);
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      
      // Add avatar if changed
      if (avatar) {
        formData.append('avatar', avatar);
      }

      await dispatch(updateUser(formData)).unwrap();
      toast.success('Profil berhasil diperbarui!');
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await dispatch(changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })).unwrap();
      
      passwordForm.reset();
      toast.success('Password berhasil diubah!');
    } catch (error) {
      console.error('Password change error:', error);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: UserIcon },
    { id: 'security', label: 'Keamanan', icon: KeyIcon },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <>
      <Helmet>
        <title>Profil - Portal Berita</title>
        <meta name="description" content="Kelola profil dan pengaturan akun Anda" />
      </Helmet>

      <div className="min-h-screen bg-secondary-50">
        <div className="container-custom py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center">
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                Pengaturan Profil
              </h1>
              <p className="text-secondary-600">
                Kelola informasi akun dan pengaturan keamanan Anda
              </p>
            </motion.div>

            {/* Profile Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user?.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-12 h-12 text-primary-600" />
                    </div>
                  )}
                  <button
                    onClick={() => document.getElementById('avatar-upload').click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                  >
                    <CameraIcon className="w-4 h-4" />
                  </button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAvatarChange(e.target.files[0])}
                    className="hidden"
                  />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900">{user?.name}</h2>
                  <p className="text-secondary-600">{user?.email}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-500">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Bergabung {new Date(user?.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user?.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.emailVerified ? 'Email Terverifikasi' : 'Email Belum Terverifikasi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-secondary-200 mb-8">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-secondary-500 hover:text-secondary-700'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                          <label className="form-label">Nama Lengkap *</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <UserIcon className="h-5 w-5 text-secondary-400" />
                            </div>
                            <input
                              {...profileForm.register('name')}
                              type="text"
                              className={`form-input pl-10 ${profileForm.formState.errors.name ? 'border-red-500' : ''}`}
                             placeholder="Masukkan nama lengkap"
                           />
                         </div>
                         {profileForm.formState.errors.name && (
                           <p className="form-error">{profileForm.formState.errors.name.message}</p>
                         )}
                       </div>

                       {/* Email */}
                       <div>
                         <label className="form-label">Email *</label>
                         <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <EnvelopeIcon className="h-5 w-5 text-secondary-400" />
                           </div>
                           <input
                             {...profileForm.register('email')}
                             type="email"
                             className={`form-input pl-10 ${profileForm.formState.errors.email ? 'border-red-500' : ''}`}
                             placeholder="Masukkan email"
                           />
                         </div>
                         {profileForm.formState.errors.email && (
                           <p className="form-error">{profileForm.formState.errors.email.message}</p>
                         )}
                       </div>

                       {/* Phone */}
                       <div>
                         <label className="form-label">Nomor Telepon</label>
                         <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <PhoneIcon className="h-5 w-5 text-secondary-400" />
                           </div>
                           <input
                             {...profileForm.register('phone')}
                             type="tel"
                             className={`form-input pl-10 ${profileForm.formState.errors.phone ? 'border-red-500' : ''}`}
                             placeholder="Masukkan nomor telepon"
                           />
                         </div>
                         {profileForm.formState.errors.phone && (
                           <p className="form-error">{profileForm.formState.errors.phone.message}</p>
                         )}
                       </div>

                       {/* Location */}
                       <div>
                         <label className="form-label">Lokasi</label>
                         <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <MapPinIcon className="h-5 w-5 text-secondary-400" />
                           </div>
                           <input
                             {...profileForm.register('location')}
                             type="text"
                             className={`form-input pl-10 ${profileForm.formState.errors.location ? 'border-red-500' : ''}`}
                             placeholder="Kota, Negara"
                           />
                         </div>
                         {profileForm.formState.errors.location && (
                           <p className="form-error">{profileForm.formState.errors.location.message}</p>
                         )}
                       </div>
                     </div>

                     {/* Website */}
                     <div>
                       <label className="form-label">Website</label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <LinkIcon className="h-5 w-5 text-secondary-400" />
                         </div>
                         <input
                           {...profileForm.register('website')}
                           type="url"
                           className={`form-input pl-10 ${profileForm.formState.errors.website ? 'border-red-500' : ''}`}
                           placeholder="https://website-anda.com"
                         />
                       </div>
                       {profileForm.formState.errors.website && (
                         <p className="form-error">{profileForm.formState.errors.website.message}</p>
                       )}
                     </div>

                     {/* Bio */}
                     <div>
                       <label className="form-label">Bio</label>
                       <textarea
                         {...profileForm.register('bio')}
                         rows="4"
                         className={`form-textarea ${profileForm.formState.errors.bio ? 'border-red-500' : ''}`}
                         placeholder="Ceritakan tentang diri Anda..."
                         maxLength="500"
                       />
                       <div className="flex justify-between text-xs text-secondary-500 mt-1">
                         <span>Bio akan tampil di profil publik Anda</span>
                         <span>{profileForm.watch('bio')?.length || 0}/500</span>
                       </div>
                       {profileForm.formState.errors.bio && (
                         <p className="form-error">{profileForm.formState.errors.bio.message}</p>
                       )}
                     </div>

                     {/* Submit Button */}
                     <div className="flex justify-end">
                       <motion.button
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         type="submit"
                         disabled={loading}
                         className="btn-primary relative"
                       >
                         {loading ? (
                           <LoadingSpinner size="small" color="white" />
                         ) : (
                           <>
                             <CheckIcon className="w-4 h-4 mr-2" />
                             <span>Simpan Perubahan</span>
                           </>
                         )}
                       </motion.button>
                     </div>
                   </form>
                 </motion.div>
               )}

               {activeTab === 'security' && (
                 <motion.div
                   key="security"
                   variants={tabContentVariants}
                   initial="hidden"
                   animate="visible"
                   exit="exit"
                   className="space-y-8"
                 >
                   {/* Change Password */}
                   <div>
                     <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                       Ubah Password
                     </h3>
                     <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                       {/* Current Password */}
                       <div>
                         <label className="form-label">Password Saat Ini *</label>
                         <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <KeyIcon className="h-5 w-5 text-secondary-400" />
                           </div>
                           <input
                             {...passwordForm.register('currentPassword')}
                             type={showPasswords.current ? 'text' : 'password'}
                             className={`form-input pl-10 pr-10 ${passwordForm.formState.errors.currentPassword ? 'border-red-500' : ''}`}
                             placeholder="Masukkan password saat ini"
                           />
                           <button
                             type="button"
                             className="absolute inset-y-0 right-0 pr-3 flex items-center"
                             onClick={() => togglePasswordVisibility('current')}
                           >
                             {showPasswords.current ? (
                               <EyeSlashIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                             ) : (
                               <EyeIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                             )}
                           </button>
                         </div>
                         {passwordForm.formState.errors.currentPassword && (
                           <p className="form-error">{passwordForm.formState.errors.currentPassword.message}</p>
                         )}
                       </div>

                       {/* New Password */}
                       <div>
                         <label className="form-label">Password Baru *</label>
                         <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <KeyIcon className="h-5 w-5 text-secondary-400" />
                           </div>
                           <input
                             {...passwordForm.register('newPassword')}
                             type={showPasswords.new ? 'text' : 'password'}
                             className={`form-input pl-10 pr-10 ${passwordForm.formState.errors.newPassword ? 'border-red-500' : ''}`}
                             placeholder="Masukkan password baru"
                           />
                           <button
                             type="button"
                             className="absolute inset-y-0 right-0 pr-3 flex items-center"
                             onClick={() => togglePasswordVisibility('new')}
                           >
                             {showPasswords.new ? (
                               <EyeSlashIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                             ) : (
                               <EyeIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                             )}
                           </button>
                         </div>
                         {passwordForm.formState.errors.newPassword && (
                           <p className="form-error">{passwordForm.formState.errors.newPassword.message}</p>
                         )}
                       </div>

                       {/* Confirm Password */}
                       <div>
                         <label className="form-label">Konfirmasi Password Baru *</label>
                         <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <KeyIcon className="h-5 w-5 text-secondary-400" />
                           </div>
                           <input
                             {...passwordForm.register('confirmPassword')}
                             type={showPasswords.confirm ? 'text' : 'password'}
                             className={`form-input pl-10 pr-10 ${passwordForm.formState.errors.confirmPassword ? 'border-red-500' : ''}`}
                             placeholder="Konfirmasi password baru"
                           />
                           <button
                             type="button"
                             className="absolute inset-y-0 right-0 pr-3 flex items-center"
                             onClick={() => togglePasswordVisibility('confirm')}
                           >
                             {showPasswords.confirm ? (
                               <EyeSlashIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                             ) : (
                               <EyeIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                             )}
                           </button>
                         </div>
                         {passwordForm.formState.errors.confirmPassword && (
                           <p className="form-error">{passwordForm.formState.errors.confirmPassword.message}</p>
                         )}
                       </div>

                       {/* Password Requirements */}
                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                         <h4 className="text-sm font-medium text-blue-900 mb-2">
                           Syarat Password:
                         </h4>
                         <ul className="text-sm text-blue-700 space-y-1">
                           <li>• Minimal 6 karakter</li>
                           <li>• Mengandung huruf besar dan kecil</li>
                           <li>• Mengandung minimal 1 angka</li>
                         </ul>
                       </div>

                       {/* Submit Button */}
                       <div className="flex justify-end">
                         <motion.button
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           type="submit"
                           disabled={loading}
                           className="btn-primary relative"
                         >
                           {loading ? (
                             <LoadingSpinner size="small" color="white" />
                           ) : (
                             <>
                               <KeyIcon className="w-4 h-4 mr-2" />
                               <span>Ubah Password</span>
                             </>
                           )}
                         </motion.button>
                       </div>
                     </form>
                   </div>

                   {/* Security Settings */}
                   <div className="border-t border-secondary-200 pt-8">
                     <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                       Pengaturan Keamanan
                     </h3>
                     <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                         <div>
                           <h4 className="font-medium text-secondary-900">Verifikasi Email</h4>
                           <p className="text-sm text-secondary-600">
                             {user?.emailVerified 
                               ? 'Email Anda sudah terverifikasi' 
                               : 'Verifikasi email untuk keamanan tambahan'
                             }
                           </p>
                         </div>
                         {user?.emailVerified ? (
                           <div className="flex items-center space-x-2 text-green-600">
                             <CheckIcon className="w-5 h-5" />
                             <span className="text-sm font-medium">Terverifikasi</span>
                           </div>
                         ) : (
                           <button className="btn-outline btn-sm">
                             Kirim Verifikasi
                           </button>
                         )}
                       </div>

                       <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                         <div>
                           <h4 className="font-medium text-secondary-900">Autentikasi Dua Faktor</h4>
                           <p className="text-sm text-secondary-600">
                             Tingkatkan keamanan akun dengan 2FA
                           </p>
                         </div>
                         <button className="btn-outline btn-sm">
                           Aktifkan 2FA
                         </button>
                       </div>

                       <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                         <div>
                           <h4 className="font-medium text-secondary-900">Aktivitas Login</h4>
                           <p className="text-sm text-secondary-600">
                             Lihat riwayat login akun Anda
                           </p>
                         </div>
                         <button className="btn-outline btn-sm">
                           Lihat Aktivitas
                         </button>
                       </div>
                     </div>
                   </div>

                   {/* Danger Zone */}
                   <div className="border-t border-red-200 pt-8">
                     <h3 className="text-lg font-semibold text-red-900 mb-4">
                       Zona Berbahaya
                     </h3>
                     <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                       <h4 className="font-medium text-red-900 mb-2">
                         Hapus Akun
                       </h4>
                       <p className="text-sm text-red-700 mb-4">
                         Menghapus akun akan menghilangkan semua data Anda secara permanen. 
                         Tindakan ini tidak dapat dibatalkan.
                       </p>
                       <button className="btn-danger btn-sm">
                         Hapus Akun
                       </button>
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </motion.div>
         </motion.div>
       </div>
     </div>
   </>
 );
};

export default ProfilePage;