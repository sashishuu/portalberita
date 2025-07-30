import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockApiResponses } from '../../utils/test-utils';
import SearchModal from '../../components/common/SearchModal';

const mockOnSearch = jest.fn();
const mockOnClose = jest.fn();

describe('SearchModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search modal when open', () => {
    renderWithProviders(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSearch={mockOnSearch} 
      />
    );
    
    expect(screen.getByPlaceholderText(/cari artikel/i)).toBeInTheDocument();
    expect(screen.getByText(/pencarian populer/i)).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    renderWithProviders(
      <SearchModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onSearch={mockOnSearch} 
      />
    );
    
    expect(screen.queryByPlaceholderText(/cari artikel/i)).not.toBeInTheDocument();
  });

  test('handles search input changes', async () => {
    renderWithProviders(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSearch={mockOnSearch} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/cari artikel/i);
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(searchInput.value).toBe('test query');
  });

  test('calls onSearch when enter is pressed', () => {
    renderWithProviders(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSearch={mockOnSearch} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/cari artikel/i);
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  test('calls onClose when escape is pressed', () => {
    renderWithProviders(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSearch={mockOnSearch} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/cari artikel/i);
    fireEvent.keyDown(searchInput, { key: 'Escape', code: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('displays popular searches', () => {
    renderWithProviders(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSearch={mockOnSearch} 
      />
    );
    
    expect(screen.getByText('Politik')).toBeInTheDocument();
    expect(screen.getByText('Teknologi')).toBeInTheDocument();
    expect(screen.getByText('Ekonomi')).toBeInTheDocument();
  });

  test('handles popular search clicks', () => {
    renderWithProviders(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSearch={mockOnSearch} 
      />
    );
    
    const politikButton = screen.getByText('Politik');
    fireEvent.click(politikButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('Politik');
  });

  test('displays recent searches when available', () => {
    // Mock localStorage
    const mockRecentSearches = ['react', 'javascript', 'nodejs'];
    Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockRecentSearches));
    
    renderWithProviders(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSearch={mockOnSearch} 
      />
    );
    
    expect(screen.getByText(/pencarian terakhir/i)).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
  });

  test('clears search input when clear button is clicked', () => {
    renderWithProviders(
      <SearchModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSearch={mockOnSearch} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/cari artikel/i);
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    
    expect(searchInput.value).toBe('');
  });
});