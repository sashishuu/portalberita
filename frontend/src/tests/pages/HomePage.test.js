import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockApiResponses } from '../../utils/test-utils';
import HomePage from '../../pages/HomePage';
import * as articleSlice from '../../store/slices/articleSlice';
import * as categorySlice from '../../store/slices/categorySlice';

// Mock the async actions
jest.mock('../../store/slices/articleSlice');
jest.mock('../../store/slices/categorySlice');

describe('HomePage', () => {
  beforeEach(() => {
    // Mock dispatch functions
    articleSlice.fetchArticles = jest.fn();
    articleSlice.fetchFeaturedArticles = jest.fn();
   categorySlice.fetchCategories = jest.fn();
 });

 test('renders homepage title and description', () => {
   renderWithProviders(<HomePage />);
   
   expect(screen.getByText(/berita utama/i)).toBeInTheDocument();
   expect(screen.getByText(/kategori berita/i)).toBeInTheDocument();
 });

 test('displays loading spinner initially', () => {
   const preloadedState = {
     article: {
       articles: [],
       featuredArticles: [],
       loading: true,
       error: null,
     },
     category: {
       categories: [],
       loading: true,
     },
   };

   renderWithProviders(<HomePage />, { preloadedState });
   
   expect(screen.getByRole('status')).toBeInTheDocument();
 });

 test('displays articles when loaded', async () => {
   const preloadedState = {
     article: {
       articles: [mockApiResponses.articles.data.articles[0]],
       featuredArticles: [mockApiResponses.articles.data.articles[0]],
       loading: false,
       error: null,
     },
     category: {
       categories: mockApiResponses.categories.data,
       loading: false,
     },
   };

   renderWithProviders(<HomePage />, { preloadedState });
   
   await waitFor(() => {
     expect(screen.getByText('Test Article')).toBeInTheDocument();
   });
 });

 test('displays error message when articles fail to load', async () => {
   const preloadedState = {
     article: {
       articles: [],
       featuredArticles: [],
       loading: false,
       error: 'Failed to fetch articles',
     },
     category: {
       categories: [],
       loading: false,
     },
   };

   renderWithProviders(<HomePage />, { preloadedState });
   
   expect(screen.getByText(/failed to fetch articles/i)).toBeInTheDocument();
 });

 test('switches between latest and popular tabs', async () => {
   const preloadedState = {
     article: {
       articles: [mockApiResponses.articles.data.articles[0]],
       featuredArticles: [],
       loading: false,
       error: null,
     },
     category: {
       categories: [],
       loading: false,
     },
   };

   renderWithProviders(<HomePage />, { preloadedState });
   
   const popularTab = screen.getByRole('button', { name: /populer/i });
   const latestTab = screen.getByRole('button', { name: /terbaru/i });
   
   expect(latestTab).toHaveClass('bg-white');
   
   fireEvent.click(popularTab);
   
   await waitFor(() => {
     expect(popularTab).toHaveClass('bg-white');
   });
 });

 test('displays categories grid', async () => {
   const preloadedState = {
     article: {
       articles: [],
       featuredArticles: [],
       loading: false,
       error: null,
     },
     category: {
       categories: mockApiResponses.categories.data,
       loading: false,
     },
   };

   renderWithProviders(<HomePage />, { preloadedState });
   
   await waitFor(() => {
     expect(screen.getByText('Technology')).toBeInTheDocument();
   });
 });

 test('displays newsletter signup section', () => {
   renderWithProviders(<HomePage />);
   
   expect(screen.getByText(/jangan lewatkan berita terbaru/i)).toBeInTheDocument();
   expect(screen.getByPlaceholderText(/masukkan email anda/i)).toBeInTheDocument();
 });

 test('displays stats section', () => {
   renderWithProviders(<HomePage />);
   
   expect(screen.getByText(/1000\+/)).toBeInTheDocument();
   expect(screen.getByText(/artikel terbaru/i)).toBeInTheDocument();
   expect(screen.getByText(/50k\+/)).toBeInTheDocument();
   expect(screen.getByText(/pembaca harian/i)).toBeInTheDocument();
 });
});