import React, { useState, useEffect } from 'react';

export default function NoteModal({ isOpen, onClose, onSave, note, existingCategories, darkMode }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [error, setError] = useState('');

    // Initialize form when modal opens or note changes
    useEffect(() => {
        if (note) {
            setTitle(note.title || '');
            setContent(note.content || '');
            setCategory(note.category || '');
            setShowCategoryInput(note.category && !existingCategories.includes(note.category));
        } else {
            setTitle('');
            setContent('');
            setCategory('');
            setShowCategoryInput(false);
        }
        setError('');
    }, [note, existingCategories]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        if (!category.trim()) {
            setError('Category is required');
            return;
        }

        if (!content.trim()) {
            setError('Content is required');
            return;
        }

        // Validate category if adding a new one
        if (showCategoryInput) {
            if (!category.trim()) {
                setError('Category name cannot be empty');
                return;
            } else if (existingCategories.includes(category.trim())) {
                setError('This category already exists');
                return;
            } else if (category.trim().length > 30) {
                setError('Category name must be 30 characters or less');
                return;
            }
        }

        // Save note
        onSave({
            title: title.trim(),
            content: content.trim(),
            category: category.trim() || null
        });
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setCategory(value);

        // Clear error when changing category selection
        setError('');

        if (value === 'new') {
            setShowCategoryInput(true);
            setCategory('');
        } else {
            setShowCategoryInput(false);
        }
    };

    // Add this function to handle validation when typing in new category
    const handleNewCategoryInput = (e) => {
        const value = e.target.value;
        setCategory(value);

        // Validate category name
        if (!value.trim()) {
            setError('Category name cannot be empty');
        } else if (value.trim().length > 30) {
            setError('Category name must be 30 characters or less');
        } else if (existingCategories.includes(value.trim())) {
            setError('This category already exists');
        } else {
            setError('');
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? 'visible' : 'invisible'}`}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>

            {/* Modal */}
            <div className={`relative w-full max-w-md rounded-lg shadow-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {note ? 'Edit Note' : 'Create New Note'}
                </h2>

                {error && (
                    <div className={`p-3 mb-4 rounded ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="mb-4">
                        <label htmlFor="title" className={`block font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Title<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-900'
                                }`}
                            placeholder="Note Title"
                        />
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                        <label htmlFor="category" className={`block font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Category
                        </label>
                        {!showCategoryInput ? (
                            <div className="relative">
                                <select
                                    id="category"
                                    value={category}
                                    onChange={handleCategoryChange}
                                    className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border border-gray-300 text-gray-900'
                                        }`}
                                >
                                    <option value="">No Category</option>
                                    {existingCategories
                                        .filter(cat => cat !== 'All')
                                        .map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))
                                    }
                                    <option value="new">+ Add New Category</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                                    <svg
                                        className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="New category name"
                                    value={category}
                                    onChange={handleNewCategoryInput}
                                    className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border border-gray-300 text-gray-900'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryInput(false)}
                                    className={`p-2 rounded-md ${darkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <label htmlFor="content" className={`block font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Content<span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="content"
                            rows="5"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-900'
                                }`}
                            placeholder="Note content..."
                        ></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-md ${darkMode
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {note ? 'Save Changes' : 'Create Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}