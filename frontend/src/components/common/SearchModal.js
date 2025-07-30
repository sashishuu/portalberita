import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  TrendingUpIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

import { searchArticles, clearSearchResults } from '../../store/slices/articleSlice';
import LoadingSpinner from './LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const SearchModal = ({ isOpen, onClose, onSearch }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  
  const { searchResults, searchLoading } = useSelector((state) => state.article);
  
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Popular searches (could be fetched from API)
  const popularSearches = [
    'Politik',
    'Ekonomi',
    'Teknologi',
    'Olahraga',
    'Kesehatan',
    'Pendidikan',
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim() && debouncedQuery.length >= 2) {
      dispatch(searchArticles({ 
        search: debouncedQuery,
        limit: 5 
      }));
    } else {
      dispatch(clearSearchResults());
    }
  }, [debouncedQuery, dispatch]);

  // Clear results when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      dispatch(clearSearchResults());
    }
  }, [isOpen, dispatch]);

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      // Save to recent searches
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 5);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

      // Navigate to search results
      onSearch(searchQuery);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: id 
    });
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
   },
 };

 const resultVariants = {
   hidden: { opacity: 0, y: 10 },
   visible: { opacity: 1, y: 0 },
   exit: { opacity: 0, y: -10 },
 };

 return (
   <AnimatePresence>
     {isOpen && (
       <motion.div
         variants={modalVariants}
         initial="hidden"
         animate="visible"
         exit="exit"
         className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm"
         onClick={onClose}
       >
         <motion.div
           variants={contentVariants}
           onClick={(e) => e.stopPropagation()}
           className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
         >
           {/* Search Input */}
           <div className="flex items-center space-x-4 p-6 border-b border-secondary-200">
             <MagnifyingGlassIcon className="w-6 h-6 text-secondary-400 flex-shrink-0" />
             <input
               ref={inputRef}
               type="text"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Cari artikel, kategori, atau penulis..."
               className="flex-1 text-lg placeholder-secondary-400 border-none outline-none bg-transparent"
             />
             {query && (
               <button
                 onClick={() => setQuery('')}
                 className="p-1 text-secondary-400 hover:text-secondary-600 rounded-full hover:bg-secondary-100 transition-colors"
               >
                 <XMarkIcon className="w-5 h-5" />
               </button>
             )}
             <button
               onClick={onClose}
               className="p-2 text-secondary-400 hover:text-secondary-600 rounded-full hover:bg-secondary-100 transition-colors"
             >
               <XMarkIcon className="w-6 h-6" />
             </button>
           </div>

           {/* Search Results */}
           <div className="max-h-96 overflow-y-auto">
             {searchLoading && query.length >= 2 && (
               <div className="flex items-center justify-center py-8">
                 <LoadingSpinner text="Mencari..." />
               </div>
             )}

             {/* Search Results */}
             {searchResults.length > 0 && (
               <motion.div
                 variants={resultVariants}
                 initial="hidden"
                 animate="visible"
                 exit="exit"
                 className="p-4"
               >
                 <h3 className="text-sm font-semibold text-secondary-700 mb-3 px-2">
                   Hasil Pencarian
                 </h3>
                 <div className="space-y-2">
                   {searchResults.map((article) => (
                     <motion.button
                       key={article._id}
                       whileHover={{ backgroundColor: '#f8fafc' }}
                       onClick={() => {
                         navigate(`/article/${article.slug}`);
                         onClose();
                       }}
                       className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-secondary-50 transition-colors"
                     >
                       {article.image && (
                         <img
                           src={article.image.startsWith('http') 
                             ? article.image 
                             : `${process.env.REACT_APP_API_URL}/${article.image}`
                           }
                           alt={article.title}
                           className="w-12 h-9 object-cover rounded flex-shrink-0"
                         />
                       )}
                       <div className="flex-1 min-w-0">
                         <h4 className="font-medium text-secondary-900 line-clamp-1">
                           {article.title}
                         </h4>
                         <div className="flex items-center space-x-2 mt-1 text-xs text-secondary-500">
                           <span>{article.author?.name}</span>
                           <span>•</span>
                           <span>{formatDate(article.createdAt)}</span>
                           {article.category && (
                             <>
                               <span>•</span>
                               <span>{article.category.name}</span>
                             </>
                           )}
                         </div>
                       </div>
                       <DocumentTextIcon className="w-5 h-5 text-secondary-400 flex-shrink-0" />
                     </motion.button>
                   ))}
                 </div>
                 
                 {query.trim() && (
                   <div className="mt-4 pt-3 border-t border-secondary-200">
                     <button
                       onClick={() => handleSearch(query)}
                       className="w-full flex items-center space-x-2 p-3 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                     >
                       <MagnifyingGlassIcon className="w-5 h-5" />
                       <span>Lihat semua hasil untuk "{query}"</span>
                     </button>
                   </div>
                 )}
               </motion.div>
             )}

             {/* No Results */}
             {!searchLoading && query.length >= 2 && searchResults.length === 0 && (
               <div className="p-8 text-center">
                 <MagnifyingGlassIcon className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                 <h3 className="text-lg font-medium text-secondary-900 mb-2">
                   Tidak ada hasil
                 </h3>
                 <p className="text-secondary-600">
                   Coba gunakan kata kunci yang berbeda
                 </p>
               </div>
             )}

             {/* Recent Searches */}
             {!query && recentSearches.length > 0 && (
               <div className="p-4">
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="text-sm font-semibold text-secondary-700 px-2">
                     Pencarian Terakhir
                   </h3>
                   <button
                     onClick={clearRecentSearches}
                     className="text-xs text-secondary-500 hover:text-secondary-700 px-2"
                   >
                     Hapus Semua
                   </button>
                 </div>
                 <div className="space-y-1">
                   {recentSearches.map((search, index) => (
                     <motion.button
                       key={index}
                       whileHover={{ backgroundColor: '#f8fafc' }}
                       onClick={() => handleSearch(search)}
                       className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-secondary-50 transition-colors"
                     >
                       <ClockIcon className="w-5 h-5 text-secondary-400" />
                       <span className="text-secondary-700">{search}</span>
                     </motion.button>
                   ))}
                 </div>
               </div>
             )}

             {/* Popular Searches */}
             {!query && (
               <div className="p-4">
                 <h3 className="text-sm font-semibold text-secondary-700 mb-3 px-2">
                   Pencarian Populer
                 </h3>
                 <div className="space-y-1">
                   {popularSearches.map((search, index) => (
                     <motion.button
                       key={index}
                       whileHover={{ backgroundColor: '#f8fafc' }}
                       onClick={() => handleSearch(search)}
                       className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-secondary-50 transition-colors"
                     >
                       <TrendingUpIcon className="w-5 h-5 text-secondary-400" />
                       <span className="text-secondary-700">{search}</span>
                     </motion.button>
                   ))}
                 </div>
               </div>
             )}
           </div>
         </motion.div>
       </motion.div>
     )}
   </AnimatePresence>
 );
};

export default SearchModal;