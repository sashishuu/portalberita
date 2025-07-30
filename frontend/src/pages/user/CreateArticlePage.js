import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import {
  DocumentTextIcon,
  PhotoIcon,
  EyeIcon,
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

// Import rich text editor
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { createArticle } from '../../store/slices/articleSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageUpload from '../../components/common/ImageUpload';

// Validation schema
const articleSchema = yup.object({
  title: yup
    .string()
    .min(10, 'Judul minimal 10 karakter')
    .max(100, 'Judul maksimal 100 karakter')
    .required('Judul wajib diisi'),
  excerpt: yup
    .string()
    .min(50, 'Ringkasan minimal 50 karakter')
    .max(300, 'Ringkasan maksimal 300 karakter')
    .required('Ringkasan wajib diisi'),
  content: yup
    .string()
    .min(500, 'Konten minimal 500 karakter')
    .required('Konten wajib diisi'),
  category: yup
    .string()
    .required('Kategori wajib dipilih'),
  tags: yup
    .array()
    .min(1, 'Minimal 1 tag')
    .max(10, 'Maksimal 10 tag'),
  status: yup
    .string()
    .oneOf(['draft', 'published'], 'Status tidak valid')
    .required('Status wajib dipilih'),
});

const CreateArticlePage = () => {
  const navigate = useNavigate();
 const dispatch = useDispatch();
 const { loading } = useSelector((state) => state.article);
 const { categories, loading: categoriesLoading } = useSelector((state) => state.category);
 const { user } = useSelector((state) => state.auth);

 const [image, setImage] = useState(null);
 const [imagePreview, setImagePreview] = useState(null);
 const [tagInput, setTagInput] = useState('');
 const [selectedTags, setSelectedTags] = useState([]);
 const [isPreviewMode, setIsPreviewMode] = useState(false);
 const [wordCount, setWordCount] = useState(0);
 const quillRef = useRef(null);

 const {
   register,
   handleSubmit,
   control,
   formState: { errors },
   watch,
   setValue,
   getValues,
 } = useForm({
   resolver: yupResolver(articleSchema),
   defaultValues: {
     title: '',
     excerpt: '',
     content: '',
     category: '',
     tags: [],
     status: 'draft',
     featured: false,
   },
 });

 const watchedContent = watch('content');
 const watchedTitle = watch('title');

 // Load categories on mount
 useEffect(() => {
   dispatch(fetchCategories());
 }, [dispatch]);

 // Update word count
 useEffect(() => {
   if (watchedContent) {
     // Remove HTML tags and count words
     const textContent = watchedContent.replace(/<[^>]*>/g, '');
     const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
     setWordCount(words.length);
   }
 }, [watchedContent]);

 // Update tags in form when selectedTags changes
 useEffect(() => {
   setValue('tags', selectedTags);
 }, [selectedTags, setValue]);

 const handleImageChange = (file) => {
   setImage(file);
   if (file) {
     const reader = new FileReader();
     reader.onloadend = () => {
       setImagePreview(reader.result);
     };
     reader.readAsDataURL(file);
   } else {
     setImagePreview(null);
   }
 };

 const handleAddTag = () => {
   const trimmedTag = tagInput.trim();
   if (trimmedTag && !selectedTags.includes(trimmedTag) && selectedTags.length < 10) {
     setSelectedTags([...selectedTags, trimmedTag]);
     setTagInput('');
   }
 };

 const handleRemoveTag = (tagToRemove) => {
   setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
 };

 const handleTagInputKeyDown = (e) => {
   if (e.key === 'Enter') {
     e.preventDefault();
     handleAddTag();
   }
 };

 const onSubmit = async (data) => {
   try {
     const articleData = {
       ...data,
       tags: selectedTags,
       image: image,
     };

     await dispatch(createArticle(articleData)).unwrap();
     toast.success(`Artikel berhasil ${data.status === 'published' ? 'dipublikasi' : 'disimpan sebagai draft'}!`);
     navigate('/my-articles');
   } catch (error) {
     console.error('Create article error:', error);
   }
 };

 const generateSlug = (title) => {
   return title
     .toLowerCase()
     .replace(/[^a-z0-9\s-]/g, '')
     .replace(/\s+/g, '-')
     .replace(/-+/g, '-')
     .trim('-');
 };

 // Quill editor configuration
 const quillModules = {
   toolbar: {
     container: [
       [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
       ['bold', 'italic', 'underline', 'strike'],
       [{ 'color': [] }, { 'background': [] }],
       [{ 'script': 'sub'}, { 'script': 'super' }],
       ['blockquote', 'code-block'],
       [{ 'list': 'ordered'}, { 'list': 'bullet' }],
       [{ 'indent': '-1'}, { 'indent': '+1' }],
       [{ 'align': [] }],
       ['link', 'image', 'video'],
       ['clean']
     ],
   },
   clipboard: {
     matchVisual: false,
   }
 };

 const quillFormats = [
   'header', 'font', 'size',
   'bold', 'italic', 'underline', 'strike', 'blockquote',
   'list', 'bullet', 'indent',
   'link', 'image', 'video',
   'color', 'background',
   'align', 'script'
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

 if (!user) {
   navigate('/login');
   return null;
 }

 return (
   <>
     <Helmet>
       <title>Tulis Artikel - Portal Berita</title>
       <meta name="description" content="Tulis dan publikasikan artikel baru di Portal Berita" />
     </Helmet>

     <div className="min-h-screen bg-secondary-50">
       <div className="container-custom py-8">
         <motion.div
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           className="max-w-4xl mx-auto"
         >
           {/* Header */}
           <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
             <div className="flex items-center space-x-4">
               <button
                 onClick={() => navigate(-1)}
                 className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
               >
                 <ArrowLeftIcon className="w-5 h-5" />
               </button>
               <div>
                 <h1 className="text-2xl font-bold text-secondary-900">
                   Tulis Artikel Baru
                 </h1>
                 <p className="text-secondary-600">
                   Bagikan cerita dan pengetahuan Anda dengan dunia
                 </p>
               </div>
             </div>

             <div className="flex items-center space-x-3">
               <button
                 onClick={() => setIsPreviewMode(!isPreviewMode)}
                 className={`btn-ghost btn-sm flex items-center space-x-2 ${
                   isPreviewMode ? 'bg-primary-100 text-primary-700' : ''
                 }`}
               >
                 <EyeIcon className="w-4 h-4" />
                 <span>Preview</span>
               </button>

               <div className="text-sm text-secondary-500">
                 {wordCount} kata
               </div>
             </div>
           </motion.div>

           {isPreviewMode ? (
             /* Preview Mode */
             <motion.div
               variants={itemVariants}
               className="bg-white rounded-xl shadow-sm p-8"
             >
               <article className="prose prose-lg max-w-none">
                 {/* Preview Header */}
                 <div className="mb-8">
                   {getValues('category') && categories.length > 0 && (
                     <div className="mb-4">
                       <span className="badge-primary">
                         {categories.find(c => c._id === getValues('category'))?.name}
                       </span>
                     </div>
                   )}
                   
                   <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                     {watchedTitle || 'Judul artikel akan muncul di sini'}
                   </h1>
                   
                   {getValues('excerpt') && (
                     <p className="text-xl text-secondary-600 leading-relaxed mb-6">
                       {getValues('excerpt')}
                     </p>
                   )}

                   <div className="flex items-center space-x-4 text-sm text-secondary-500 border-b border-secondary-200 pb-4">
                     <div className="flex items-center space-x-2">
                       {user?.avatar ? (
                         <img
                           src={user.avatar}
                           alt={user.name}
                           className="w-8 h-8 rounded-full object-cover"
                         />
                       ) : (
                         <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                           <span className="text-xs font-medium text-primary-600">
                             {user.name?.charAt(0).toUpperCase()}
                           </span>
                         </div>
                       )}
                       <span>{user.name}</span>
                     </div>
                     <span>•</span>
                     <span>{new Date().toLocaleDateString('id-ID')}</span>
                     <span>•</span>
                     <span>{Math.ceil(wordCount / 200)} menit baca</span>
                   </div>
                 </div>

                 {/* Preview Image */}
                 {imagePreview && (
                   <div className="mb-8">
                     <img
                       src={imagePreview}
                       alt="Preview"
                       className="w-full h-64 object-cover rounded-lg"
                     />
                   </div>
                 )}

                 {/* Preview Content */}
                 <div 
                   className="article-content"
                   dangerouslySetInnerHTML={{ 
                     __html: watchedContent || '<p>Konten artikel akan muncul di sini...</p>' 
                   }} 
                 />

                 {/* Preview Tags */}
                 {selectedTags.length > 0 && (
                   <div className="mt-8 pt-6 border-t border-secondary-200">
                     <div className="flex flex-wrap gap-2">
                       {selectedTags.map((tag, index) => (
                         <span key={index} className="badge-secondary">
                           {tag}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}
               </article>
             </motion.div>
           ) : (
             /* Edit Mode */
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
               {/* Basic Information */}
               <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-6">
                 <h2 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center space-x-2">
                   <DocumentTextIcon className="w-5 h-5" />
                   <span>Informasi Dasar</span>
                 </h2>

                 <div className="space-y-6">
                   {/* Title */}
                   <div>
                     <label htmlFor="title" className="form-label">
                       Judul Artikel *
                     </label>
                     <input
                       {...register('title')}
                       type="text"
                       id="title"
                       className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                       placeholder="Masukkan judul artikel yang menarik..."
                     />
                     {errors.title && (
                       <p className="form-error">{errors.title.message}</p>
                     )}
                     {watchedTitle && (
                       <p className="text-xs text-secondary-500 mt-1">
                         Slug: {generateSlug(watchedTitle)}
                       </p>
                     )}
                   </div>

                   {/* Excerpt */}
                   <div>
                     <label htmlFor="excerpt" className="form-label">
                       Ringkasan Artikel *
                     </label>
                     <textarea
                       {...register('excerpt')}
                       id="excerpt"
                       rows="3"
                       className={`form-textarea ${errors.excerpt ? 'border-red-500' : ''}`}
                       placeholder="Tulis ringkasan singkat tentang artikel ini..."
                       maxLength="300"
                     />
                     {errors.excerpt && (
                       <p className="form-error">{errors.excerpt.message}</p>
                     )}
                     <div className="flex justify-between text-xs text-secondary-500 mt-1">
                       <span>Ringkasan akan muncul di daftar artikel dan media sosial</span>
                       <span>{watch('excerpt')?.length || 0}/300</span>
                     </div>
                   </div>

                   {/* Category */}
                   <div>
                     <label htmlFor="category" className="form-label">
                       Kategori *
                     </label>
                     <select
                       {...register('category')}
                       id="category"
                       className={`form-select ${errors.category ? 'border-red-500' : ''}`}
                     >
                       <option value="">Pilih kategori</option>
                       {categories.map((category) => (
                         <option key={category._id} value={category._id}>
                           {category.name}
                         </option>
                       ))}
                     </select>
                     {errors.category && (
                       <p className="form-error">{errors.category.message}</p>
                     )}
                     {categoriesLoading && (
                       <p className="text-xs text-secondary-500 mt-1">Memuat kategori...</p>
                     )}
                   </div>
                 </div>
               </motion.div>

               {/* Featured Image */}
               <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-6">
                 <h2 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center space-x-2">
                   <PhotoIcon className="w-5 h-5" />
                   <span>Gambar Utama</span>
                 </h2>

                 <ImageUpload
                   onImageChange={handleImageChange}
                   preview={imagePreview}
                   className="w-full h-64"
                 />

                 <div className="mt-3 flex items-start space-x-2 text-sm text-secondary-600">
                   <InformationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                   <div>
                     <p>Gambar akan digunakan sebagai thumbnail artikel.</p>
                     <p>Ukuran yang disarankan: 1200x630 px, maksimal 2MB.</p>
                   </div>
                 </div>
               </motion.div>

               {/* Content Editor */}
               <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-6">
                 <h2 className="text-lg font-semibold text-secondary-900 mb-6">
                   Konten Artikel *
                 </h2>

                 <Controller
                   name="content"
                   control={control}
                   render={({ field }) => (
                     <ReactQuill
                       ref={quillRef}
                       theme="snow"
                       value={field.value}
                       onChange={field.onChange}
                       modules={quillModules}
                       formats={quillFormats}
                       placeholder="Mulai menulis artikel Anda di sini..."
                       style={{ minHeight: '400px' }}
                     />
                   )}
                 />
                 
                 {errors.content && (
                   <p className="form-error mt-2">{errors.content.message}</p>
                 )}

                 <div className="flex justify-between items-center mt-3 text-xs text-secondary-500">
                   <span>Gunakan toolbar di atas untuk memformat teks</span>
                   <span>{wordCount} kata • {Math.ceil(wordCount / 200)} menit baca</span>
                 </div>
               </motion.div>

               {/* Tags */}
               <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-6">
                 <h2 className="text-lg font-semibold text-secondary-900 mb-6">
                   Tags
                 </h2>

                 <div className="space-y-4">
                   <div className="flex space-x-2">
                     <input
                       type="text"
                       value={tagInput}
                       onChange={(e) => setTagInput(e.target.value)}
                       onKeyDown={handleTagInputKeyDown}
                       placeholder="Tambahkan tag..."
                       className="flex-1 form-input"
                       maxLength="30"
                     />
                     <button
                       type="button"
                       onClick={handleAddTag}
                       disabled={!tagInput.trim() || selectedTags.length >= 10}
                       className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <PlusIcon className="w-4 h-4" />
                     </button>
                   </div>

                   {selectedTags.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                       {selectedTags.map((tag, index) => (
                         <span
                           key={index}
                           className="inline-flex items-center space-x-2 badge-secondary"
                         >
                           <span>{tag}</span>
                           <button
                             type="button"
                             onClick={() => handleRemoveTag(tag)}
                             className="text-secondary-500 hover:text-red-500"
                           >
                             <XMarkIcon className="w-3 h-3" />
                           </button>
                         </span>
                       ))}
                     </div>
                   )}

                   <div className="text-xs text-secondary-500">
                     Tags membantu pembaca menemukan artikel Anda. Maksimal 10 tags.
                   </div>
                 </div>
               </motion.div>

               {/* Publish Options */}
               <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-6">
                 <h2 className="text-lg font-semibold text-secondary-900 mb-6">
                   Opsi Publikasi
                 </h2>

                 <div className="space-y-4">
                   <div>
                     <label className="form-label">Status Publikasi</label>
                     <div className="space-y-2">
                       <label className="flex items-center">
                         <input
                           {...register('status')}
                           type="radio"
                           value="draft"
                           className="form-radio"
                         />
                         <span className="ml-2">Simpan sebagai Draft</span>
                       </label>
                       <label className="flex items-center">
                         <input
                           {...register('status')}
                           type="radio"
                           value="published"
                           className="form-radio"
                         />
                         <span className="ml-2">Publikasikan Sekarang</span>
                       </label>
                     </div>
                   </div>

                   {user?.role === 'admin' && (
                     <div>
                       <label className="flex items-center">
                         <input
                           {...register('featured')}
                           type="checkbox"
                           className="form-checkbox"
                         />
                         <span className="ml-2">Jadikan artikel unggulan</span>
                       </label>
                     </div>
                   )}
                 </div>
               </motion.div>

               {/* Submit Buttons */}
               <motion.div variants={itemVariants} className="flex justify-end space-x-4">
                 <button
                   type="button"
                   onClick={() => navigate(-1)}
                   className="btn-ghost"
                 >
                   Batal
                 </button>
                 
                 <button
                   type="submit"
                   disabled={loading}
                   className="btn-primary relative"
                 >
                   {loading ? (
                     <LoadingSpinner size="small" color="white" />
                   ) : (
                     <span>
                       {watch('status') === 'published' ? 'Publikasikan' : 'Simpan Draft'}
                     </span>
                   )}
                 </button>
               </motion.div>
             </form>
           )}
         </motion.div>
       </div>
     </div>
   </>
 );
};






export default CreateArticlePage;