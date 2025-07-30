import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchArticleBySlug, updateArticle } from '../../store/slices/articleSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditArticlePage = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { article, loading, error } = useSelector(state => state.article);
    const { categories } = useSelector(state => state.category);
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');

    useEffect(() => {
        dispatch(fetchArticleBySlug(slug));
        dispatch(fetchCategories());
    }, [dispatch, slug]);

    useEffect(() => {
        if (article) {
            setTitle(article.title);
            setContent(article.content);
            setCategory(article.category._id);
            setTags(article.tags.join(', '));
        }
    }, [article]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const articleData = { title, content, category, tags };
        dispatch(updateArticle({ id: article._id, articleData }))
            .then(() => {
                navigate(`/article/${article.slug}`);
            });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading article.</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Article</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    >
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                    <ReactQuill theme="snow" value={content} onChange={setContent} />
                </div>
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    {loading ? 'Updating...' : 'Update Article'}
                </button>
            </form>
        </div>
    );
};

export default EditArticlePage;