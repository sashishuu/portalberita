import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

import { searchArticles, clearSearchResults } from '../store/slices/articleSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import ArticleCard from '../components/article/ArticleCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { searchResults, searchLoading, error } = useSelector(state => state.article);
  const { categories } = useSelector(state => state.category);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    sort: searchParams.get('sort') || 'relevance',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    dispatch(fetchCategories());
    
    // Load search history
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);

    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      performSearch(queryParam);
    }
  }, [searchParams]);

  const performSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;

    const searchData = {
      search: searchQuery,
      ...filters,
      limit: 20,
    };

    dispatch(searchArticles(searchData));

    // Save to search history
    const newHistory = [
      searchQuery,
      ...searchHistory.filter(item => item !== searchQuery)
    ].slice(0, 10);
    
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Update URL
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.set(key, filters[key]);
      }
    });
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (query.trim()) {
      const searchData = {
        search: query,
        ...newFilters,
        limit: 20,
      };
      dispatch(searchArticles(searchData));
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      dateFrom: '',
      dateTo: '',
      sort: 'relevance',
    });
    
    if (query.trim()) {
      dispatch(searchArticles({
        search: query,
        limit: 20,
      }));
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
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

  const currentQuery = searchParams.get('q');

  return (
    <>
      <Helmet>
        <title>{currentQuery ? `Pencarian: ${currentQuery}` : 'Pencarian'} - Portal Berita</title>
        <meta name="description" content={`Hasil pencarian untuk "${currentQuery}" di Portal Berita`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="container-custom py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Search Header */}
            <motion.div variants={itemVariants} className="text-center">
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                Pencarian Artikel
              </h1>
              <p className="text-secondary-600">
                Temukan artikel yang Anda cari di Portal Berita
              </p>
            </motion.div>

            {/* Search Form */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Main Search */}
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cari artikel, kategori, atau penulis..."
                      className="w-full pl-10 pr-4 py-3 text-lg border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary px-8"
                  >
                    Cari
                  </button>
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-ghost btn-sm flex items-center space-x-2"
                  >
                    <FunnelIcon className="w-4 h-4" />
                    <span>Filter Pencarian</span>
                  </button>

                  {Object.values(filters).some(v => v) && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="btn-ghost btn-sm text-red-600 hover:bg-red-50"
                    >
                      <XMarkIcon className="w-4 h-4 mr-1" />
                      Hapus Filter
                    </button>
                  )}
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-secondary-200 overflow-hidden"
                  >
                    <div>
                      <label className="form-label flex items-center space-x-1">
                        <TagIcon className="w-4 h-4" />
                        <span>Kategori</span>
                      </label>
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
                      <label className="form-label flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Dari Tanggal</span>
                      </label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Sampai Tanggal</span>
                      </label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
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
                        <option value="relevance">Relevansi</option>
                        <option value="newest">Terbaru</option>
                        <option value="oldest">Terlama</option>
                        <option value="popular">Populer</option>
                       <option value="title">Judul A-Z</option>
                     </select>
                   </div>
                 </motion.div>
               )}
             </form>

             {/* Search History */}
             {!currentQuery && searchHistory.length > 0 && (
               <div className="mt-6 pt-6 border-t border-secondary-200">
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="text-sm font-semibold text-secondary-700">
                     Pencarian Terakhir
                   </h3>
                   <button
                     onClick={clearSearchHistory}
                     className="text-xs text-secondary-500 hover:text-secondary-700"
                   >
                     Hapus Semua
                   </button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {searchHistory.map((item, index) => (
                     <button
                       key={index}
                       onClick={() => {
                         setQuery(item);
                         performSearch(item);
                       }}
                       className="px-3 py-1 text-sm bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200 transition-colors"
                     >
                       {item}
                     </button>
                   ))}
                 </div>
               </div>
             )}
           </motion.div>

           {/* Search Results */}
           {currentQuery && (
             <motion.div variants={itemVariants}>
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-secondary-900">
                   Hasil pencarian untuk "{currentQuery}"
                 </h2>
                 {searchResults.length > 0 && (
                   <span className="text-secondary-600">
                     {searchResults.length} artikel ditemukan
                   </span>
                 )}
               </div>

               {searchLoading ? (
                 <div className="flex items-center justify-center py-12">
                   <LoadingSpinner size="lg" text="Mencari artikel..." />
                 </div>
               ) : error ? (
                 <ErrorMessage 
                   message={error} 
                   onRetry={() => performSearch(currentQuery)}
                 />
               ) : searchResults.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {searchResults.map((article) => (
                     <ArticleCard
                       key={article._id}
                       article={article}
                       showAuthor={true}
                       showCategory={true}
                       showStats={true}
                     />
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <MagnifyingGlassIcon className="w-10 h-10 text-secondary-400" />
                   </div>
                   <h3 className="text-lg font-medium text-secondary-900 mb-2">
                     Tidak ada hasil ditemukan
                   </h3>
                   <p className="text-secondary-600 mb-4">
                     Coba gunakan kata kunci yang berbeda atau ubah filter pencarian
                   </p>
                   <div className="space-y-2">
                     <p className="text-sm text-secondary-500">Tips pencarian:</p>
                     <ul className="text-sm text-secondary-500 space-y-1">
                       <li>• Gunakan kata kunci yang lebih umum</li>
                       <li>• Periksa ejaan kata kunci</li>
                       <li>• Coba hapus beberapa filter</li>
                       <li>• Gunakan sinonim atau kata yang serupa</li>
                     </ul>
                   </div>
                 </div>
               )}
             </motion.div>
           )}

           {/* Popular Searches */}
           {!currentQuery && (
             <motion.div variants={itemVariants} className="bg-secondary-50 rounded-xl p-6">
               <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                 Pencarian Populer
               </h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {[
                   'Politik', 'Ekonomi', 'Teknologi', 'Olahraga',
                   'Kesehatan', 'Pendidikan', 'Hiburan', 'Kuliner'
                 ].map((term) => (
                   <button
                     key={term}
                     onClick={() => {
                       setQuery(term);
                       performSearch(term);
                     }}
                     className="p-3 bg-white rounded-lg text-left hover:bg-primary-50 hover:text-primary-700 transition-colors"
                   >
                     <span className="font-medium">{term}</span>
                   </button>
                 ))}
               </div>
             </motion.div>
           )}
         </motion.div>
       </div>
     </div>
   </>
 );
};

export default SearchPage;