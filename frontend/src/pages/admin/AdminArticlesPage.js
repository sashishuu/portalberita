import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

import { fetchArticles, deleteArticle } from '../../store/slices/articleSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminArticlesPage = () => {
  const dispatch = useDispatch();
  const { articles, loading, totalPages, currentPage, totalArticles } = useSelector(state => state.article);
  const { categories } = useSelector(state => state.category);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    author: '',
    sort: 'newest',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, article: null });
  const [actionMenus, setActionMenus] = useState({});

  useEffect(() => {
    dispatch(fetchArticles({ 
      page: currentPage,
      limit: 10,
      ...filters 
    }));
    dispatch(fetchCategories());
  }, [dispatch, currentPage, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchArticles({ 
      page: 1,
      limit: 10,
      ...filters 
    }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchArticles({ 
      page,
      limit: 10,
      ...filters 
    }));
  };

  const handleSelectArticle = (articleId) => {
    setSelectedArticles(prev => 
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.map(article => article._id));
    }
  };

  const handleDeleteClick = (article) => {
    setDeleteModal({ isOpen: true, article });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.article) {
      try {
        await dispatch(deleteArticle(deleteModal.article._id)).unwrap();
        setDeleteModal({ isOpen: false, article: null });
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const toggleActionMenu = (articleId) => {
    setActionMenus(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: 'badge-success',
      draft: 'badge-warning',
      archived: 'badge-secondary',
    };
    const labels = {
      published: 'Published',
      draft: 'Draft',
      archived: 'Archived',
    };
    return { class: badges[status], label: labels[status] };
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: id 
    });
  };

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

  return (
    <>
      <Helmet>
        <title>Kelola Artikel - Admin Portal Berita</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Kelola Artikel</h1>
              <p className="text-secondary-600 mt-1">
                Kelola semua artikel di portal berita ({totalArticles} artikel)
              </p>
            </div>
            <Link
              to="/create-article"
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Buat Artikel</span>
            </Link>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-semibold text-secondary-900">Filter & Pencarian</h2>
             <button
               onClick={() => setShowFilters(!showFilters)}
               className="btn-ghost btn-sm flex items-center space-x-2"
             >
               <FunnelIcon className="w-4 h-4" />
               <span>Filter</span>
             </button>
           </div>

           <form onSubmit={handleSearch} className="space-y-4">
             {/* Search */}
             <div className="flex space-x-4">
               <div className="flex-1 relative">
                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                 <input
                   type="text"
                   value={filters.search}
                   onChange={(e) => handleFilterChange('search', e.target.value)}
                   placeholder="Cari artikel..."
                   className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 />
               </div>
               <button
                 type="submit"
                 className="btn-primary"
               >
                 Cari
               </button>
             </div>

             {/* Advanced Filters */}
             <AnimatePresence>
               {showFilters && (
                 <motion.div
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-secondary-200 overflow-hidden"
                 >
                   <div>
                     <label className="form-label">Kategori</label>
                     <select
                       value={filters.category}
                       onChange={(e) => handleFilterChange('category', e.target.value)}
                       className="form-select"
                     >
                       <option value="">Semua Kategori</option>
                       {categories.map(cat => (
                         <option key={cat._id} value={cat._id}>{cat.name}</option>
                       ))}
                     </select>
                   </div>

                   <div>
                     <label className="form-label">Status</label>
                     <select
                       value={filters.status}
                       onChange={(e) => handleFilterChange('status', e.target.value)}
                       className="form-select"
                     >
                       <option value="">Semua Status</option>
                       <option value="published">Published</option>
                       <option value="draft">Draft</option>
                       <option value="archived">Archived</option>
                     </select>
                   </div>

                   <div>
                     <label className="form-label">Penulis</label>
                     <input
                       type="text"
                       value={filters.author}
                       onChange={(e) => handleFilterChange('author', e.target.value)}
                       placeholder="Nama penulis..."
                       className="form-input"
                     />
                   </div>

                   <div>
                     <label className="form-label">Urutan</label>
                     <select
                       value={filters.sort}
                       onChange={(e) => handleFilterChange('sort', e.target.value)}
                       className="form-select"
                     >
                       <option value="newest">Terbaru</option>
                       <option value="oldest">Terlama</option>
                       <option value="popular">Populer</option>
                       <option value="title">Judul A-Z</option>
                     </select>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </form>
         </motion.div>

         {/* Articles Table */}
         <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
           {/* Table Header */}
           <div className="px-6 py-4 border-b border-secondary-200 bg-secondary-50">
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4">
                 <label className="flex items-center">
                   <input
                     type="checkbox"
                     checked={selectedArticles.length === articles.length && articles.length > 0}
                     onChange={handleSelectAll}
                     className="form-checkbox"
                   />
                   <span className="ml-2 text-sm text-secondary-700">
                     Pilih Semua ({selectedArticles.length})
                   </span>
                 </label>
                 
                 {selectedArticles.length > 0 && (
                   <div className="flex items-center space-x-2">
                     <button className="btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50">
                       Hapus Terpilih
                     </button>
                     <button className="btn-outline btn-sm">
                       Ubah Status
                     </button>
                   </div>
                 )}
               </div>
               
               <div className="text-sm text-secondary-600">
                 {articles.length} dari {totalArticles} artikel
               </div>
             </div>
           </div>

           {/* Table Content */}
           {loading ? (
             <div className="flex items-center justify-center py-12">
               <LoadingSpinner size="lg" text="Memuat artikel..." />
             </div>
           ) : articles.length > 0 ? (
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead className="bg-secondary-50 border-b border-secondary-200">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                       Artikel
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                       Penulis
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                       Kategori
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                       Status
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                       Views
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                       Tanggal
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                       Aksi
                     </th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-secondary-200">
                   {articles.map((article) => {
                     const statusBadge = getStatusBadge(article.status);
                     return (
                       <motion.tr
                         key={article._id}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         className="hover:bg-secondary-50 transition-colors"
                       >
                         <td className="px-6 py-4">
                           <div className="flex items-center space-x-3">
                             <input
                               type="checkbox"
                               checked={selectedArticles.includes(article._id)}
                               onChange={() => handleSelectArticle(article._id)}
                               className="form-checkbox"
                             />
                             <div className="flex items-center space-x-3">
                               {article.image && (
                                 <img
                                   src={article.image.startsWith('http') 
                                     ? article.image 
                                     : `${process.env.REACT_APP_API_URL}/${article.image}`
                                   }
                                   alt={article.title}
                                   className="w-12 h-9 object-cover rounded"
                                 />
                               )}
                               <div>
                                 <Link
                                   to={`/article/${article.slug}`}
                                   className="font-medium text-secondary-900 hover:text-primary-600 line-clamp-1"
                                 >
                                   {article.title}
                                 </Link>
                                 <p className="text-sm text-secondary-500 line-clamp-1 mt-1">
                                   {article.excerpt}
                                 </p>
                               </div>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center space-x-2">
                             {article.author?.avatar ? (
                               <img
                                 src={article.author.avatar}
                                 alt={article.author.name}
                                 className="w-6 h-6 rounded-full object-cover"
                               />
                             ) : (
                               <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                                 <span className="text-xs font-medium text-primary-600">
                                   {article.author?.name?.charAt(0)?.toUpperCase()}
                                 </span>
                               </div>
                             )}
                             <span className="text-sm text-secondary-900">
                               {article.author?.name}
                             </span>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           {article.category && (
                             <span className="badge-secondary text-xs">
                               {article.category.name}
                             </span>
                           )}
                         </td>
                         <td className="px-6 py-4">
                           <span className={`badge ${statusBadge.class} text-xs`}>
                             {statusBadge.label}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center space-x-1 text-sm text-secondary-600">
                             <EyeIcon className="w-4 h-4" />
                             <span>{article.views || 0}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-secondary-600">
                           {formatDate(article.createdAt)}
                         </td>
                         <td className="px-6 py-4">
                           <div className="relative">
                             <button
                               onClick={() => toggleActionMenu(article._id)}
                               className="p-1 text-secondary-400 hover:text-secondary-600 rounded transition-colors"
                             >
                               <EllipsisVerticalIcon className="w-5 h-5" />
                             </button>

                             <AnimatePresence>
                               {actionMenus[article._id] && (
                                 <motion.div
                                   initial={{ opacity: 0, scale: 0.95 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   exit={{ opacity: 0, scale: 0.95 }}
                                   className="absolute right-0 top-full mt-1 w-40 bg-white border border-secondary-200 rounded-lg shadow-lg py-1 z-10"
                                 >
                                   <Link
                                     to={`/article/${article.slug}`}
                                     className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                                   >
                                     <EyeIcon className="w-4 h-4" />
                                     <span>Lihat</span>
                                   </Link>
                                   <Link
                                     to={`/edit-article/${article._id}`}
                                     className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                                   >
                                     <PencilIcon className="w-4 h-4" />
                                     <span>Edit</span>
                                   </Link>
                                   <button
                                     onClick={() => handleDeleteClick(article)}
                                     className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                   >
                                     <TrashIcon className="w-4 h-4" />
                                     <span>Hapus</span>
                                   </button>
                                 </motion.div>
                               )}
                             </AnimatePresence>
                           </div>
                         </td>
                       </motion.tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="text-center py-12">
               <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <MagnifyingGlassIcon className="w-10 h-10 text-secondary-400" />
               </div>
               <h3 className="text-lg font-medium text-secondary-900 mb-2">
                 Tidak ada artikel ditemukan
               </h3>
               <p className="text-secondary-600 mb-4">
                 Coba ubah filter pencarian atau buat artikel baru
               </p>
               <Link
                 to="/create-article"
                 className="btn-primary"
               >
                 Buat Artikel Pertama
               </Link>
             </div>
           )}

           {/* Pagination */}
           {totalPages > 1 && (
             <div className="px-6 py-4 border-t border-secondary-200 bg-secondary-50">
               <div className="flex items-center justify-between">
                 <div className="text-sm text-secondary-600">
                   Halaman {currentPage} dari {totalPages}
                 </div>
                 <div className="flex items-center space-x-2">
                   <button
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage <= 1}
                     className="p-2 text-secondary-400 hover:text-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <ChevronLeftIcon className="w-5 h-5" />
                   </button>
                   
                   <div className="flex space-x-1">
                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                       const page = i + 1;
                       return (
                         <button
                           key={page}
                           onClick={() => handlePageChange(page)}
                           className={`px-3 py-1 text-sm rounded ${
                             currentPage === page
                               ? 'bg-primary-600 text-white'
                               : 'text-secondary-600 hover:bg-secondary-100'
                           }`}
                         >
                           {page}
                         </button>
                       );
                     })}
                   </div>

                   <button
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage >= totalPages}
                     className="p-2 text-secondary-400 hover:text-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <ChevronRightIcon className="w-5 h-5" />
                   </button>
                 </div>
               </div>
             </div>
           )}
         </motion.div>
       </motion.div>

       {/* Delete Confirmation Modal */}
       <ConfirmModal
         isOpen={deleteModal.isOpen}
         onClose={() => setDeleteModal({ isOpen: false, article: null })}
         onConfirm={handleDeleteConfirm}
         title="Hapus Artikel"
         message={`Apakah Anda yakin ingin menghapus artikel "${deleteModal.article?.title}"? Tindakan ini tidak dapat dibatalkan.`}
         confirmText="Hapus"
         confirmButtonClass="btn-danger"
       />
     </div>
   </>
 );
};

export default AdminArticlesPage;