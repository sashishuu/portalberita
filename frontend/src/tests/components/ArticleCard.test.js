import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockArticle } from '../../utils/test-utils';
import ArticleCard from '../../components/article/ArticleCard';

describe('ArticleCard', () => {
  test('renders article information correctly', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);
    
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    expect(screen.getByText(mockArticle.excerpt)).toBeInTheDocument();
    expect(screen.getByText(mockArticle.author.name)).toBeInTheDocument();
    expect(screen.getByText(mockArticle.category.name)).toBeInTheDocument();
  });

  test('displays stats when showStats is true', () => {
    renderWithProviders(
      <ArticleCard article={mockArticle} showStats={true} />
    );
    
    expect(screen.getByText(mockArticle.views.toString())).toBeInTheDocument();
    expect(screen.getByText(mockArticle.likes.toString())).toBeInTheDocument();
    expect(screen.getByText(mockArticle.commentsCount.toString())).toBeInTheDocument();
  });

  test('hides author when showAuthor is false', () => {
    renderWithProviders(
      <ArticleCard article={mockArticle} showAuthor={false} />
    );
    
    expect(screen.queryByText(mockArticle.author.name)).not.toBeInTheDocument();
  });

  test('hides category when showCategory is false', () => {
    renderWithProviders(
      <ArticleCard article={mockArticle} showCategory={false} />
    );
    
    expect(screen.queryByText(mockArticle.category.name)).not.toBeInTheDocument();
  });

  test('handles click on title link', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);
    
    const titleLink = screen.getByRole('link', { name: mockArticle.title });
    expect(titleLink).toHaveAttribute('href', `/article/${mockArticle.slug}`);
  });

  test('displays image when provided', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);
    
    const image = screen.getByAltText(mockArticle.title);
    expect(image).toBeInTheDocument();
  });

  test('renders horizontal layout correctly', () => {
    const { container } = renderWithProviders(
      <ArticleCard article={mockArticle} layout="horizontal" />
    );
    
    expect(container.querySelector('.flex')).toBeInTheDocument();
  });

  test('applies correct size classes', () => {
    const { container } = renderWithProviders(
      <ArticleCard article={mockArticle} size="large" />
    );
    
    const titleElement = screen.getByText(mockArticle.title);
    expect(titleElement).toHaveClass('text-xl', 'font-bold');
  });
});