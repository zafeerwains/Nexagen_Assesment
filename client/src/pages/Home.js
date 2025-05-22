import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NoteModal from '../components/Notes/NoteModal';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const styles = `
  .grid {
    display: flex;          /* Switch to flexbox layout */
    flex-wrap: wrap;       /* Allow items to wrap to the next row */
    margin: 0 -10px;        /* Adjust margins for spacing (half of gap) */
  }

  .grid > div {
    width: calc(100% - 20px); /* Default: 1 column for small screens */
    margin: 10px;          /* Add spacing between cards */
    box-sizing: border-box; /* Include padding and border in element's total width */
    transition: all 0.3s ease;
  }

  @media (min-width: 768px) { /* Medium screens (e.g., tablets) */
    .grid > div {
      width: calc(50% - 20px); /* 2 columns */
    }
  }

  @media (min-width: 1024px) { /* Large screens (e.g., desktops) */
    .grid > div {
      width: calc(33.333% - 20px); /* 3 columns */
    }
  }

  .note-content-wrapper {
    overflow: hidden;
    transition: max-height 0.4s ease-in-out; /* Smooth transition for height change */
  }

  .note-content-collapsed {
    max-height: 4.5rem; /* Approx 3 lines (assuming 1.5rem line-height per line for text-base) */
  }

  .note-content-expanded {
    max-height: 50rem; /* A large value, e.g., 800px, to accommodate long notes */
  }

  .expanded {
    width: 100% !important; /* Take full width when expanded */
  }
`;


export default function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const [notes, setNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [categories, setCategories] = useState(['All', 'Work', 'Personal', 'Ideas']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedNoteId, setExpandedNoteId] = useState(null);

    const navigate = useNavigate();
    const { darkMode, darkModeActivate } = useTheme()
    const { logout } = useAuth();

    // Fetch notes from API
    const fetchNotes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_SERVER_LINK}/api/notes`, {
                withCredentials: true,
            })
            setNotes(response.data);
            if (response.data.length > 0) {
                const uniqueCategories = new Set(['All', 'Work', 'Personal', 'Ideas']);

                response.data.forEach(note => {
                    if (note.category) {
                        uniqueCategories.add(note.category);
                    }
                });

                // Update categories state once with all unique values
                setCategories(Array.from(uniqueCategories));
            }
            setFilteredNotes(response.data);
        } catch (error) {
            console.error("Failed to fetch notes:", error);
            setError("Failed to load notes. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    // Filter notes based on search term and selected category
    useEffect(() => {
        let result = notes;

        if (searchTerm) {
            result = result.filter(note =>
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            result = result.filter(note => note.category === selectedCategory);
        }

        setFilteredNotes(result);
    }, [searchTerm, selectedCategory, notes]);

    // Toggle dark mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleCreateNote = () => {
        setCurrentNote(null);
        setIsModalOpen(true);
    };

    const handleEditNote = (note) => {
        setCurrentNote(note);
        setIsModalOpen(true);
    };

    const handleSaveNote = async (noteData) => {
        setIsLoading(true);
        setError(null);

        try {
            if (currentNote) {
                // Update existing note via API
                const response = await axios.put(`${process.env.REACT_APP_SERVER_LINK}/api/notes/${currentNote._id}`, noteData, { withCredentials: true });
            } else {
                // Create new note via API
                const response = await axios.post(`${process.env.REACT_APP_SERVER_LINK}/api/notes`, noteData, { withCredentials: true });
            }

            // Close modal on success
            setIsModalOpen(false);
        } catch (error) {
            console.error("API error:", error);
            setError(error.response?.data?.message || "Failed to save note. Please try again.");

        } finally {
            fetchNotes(); // Refresh notes after save
            setIsLoading(false);
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            setIsLoading(true);
            // Delete note via API
            await axios.delete(`${process.env.REACT_APP_SERVER_LINK}/api/notes/${id}`, { withCredentials: true });
            // Update local state
            setNotes(notes.filter(note => note.id !== id));
        } catch (error) {
            console.error("Failed to delete note:", error);
            setError("Failed to delete note. Please try again.");

        } finally {
            fetchNotes(); // Refresh notes after save
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            logout()
            // Redirect to login
            navigate('/auth/login');
        } catch (error) {
            console.error("Logout failed:", error);
            setError("Logout failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const toggleExpand = (noteId) => {
        setExpandedNoteId(prev => (prev === noteId ? null : noteId));
    };


    return (
        <>
            <style>{styles}</style>
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                <div className="container mx-auto px-4 py-8">
                    {/* Updated Header with Logout Button */}
                    <div className="flex flex-wrap justify-between items-center mb-8">
                        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            Notes App Manager
                        </h1>

                        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => darkModeActivate(darkMode)}
                                className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                disabled={isLoading}
                                className={`flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                                    }`}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                )}
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Error message if any */}
                    {error && (
                        <div className={`p-4 mb-6 rounded-md ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
                            {error}
                            <button
                                onClick={() => setError(null)}
                                className="ml-2 font-bold"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Create Button and Search Bar Row */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <button
                            onClick={handleCreateNote}
                            disabled={isLoading}
                            className={`w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md shadow-sm transition duration-300 ease-in-out flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            )}
                            Create Note
                        </button>

                        <div className="relative w-full md:w-2/3">
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                                    }`}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Categories Carousel */}
                    <div className="mb-8 overflow-x-auto no-scrollbar">
                        <div className="flex space-x-2 pb-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                                        ? 'bg-blue-500 text-white'
                                        : darkMode
                                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>


                    {/* Notes Section with Read More/Less functionality */}
                    <div className="grid">
                        {filteredNotes.length > 0 ? (
                            filteredNotes.map(note => (
                                <div
                                    key={note._id || note.id}
                                    className={`rounded-lg shadow-md overflow-hidden flex flex-col ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                                        } hover:shadow-lg transition-all duration-300 ${expandedNoteId === (note._id || note.id) ? 'expanded z-10' : ''
                                        }`}
                                >
                                    <div className="p-5 flex flex-col flex-grow"> {/* Added flex flex-col flex-grow */}
                                        <div className="flex-grow"> {/* Wrapper for content above the date */}
                                            <div className="flex justify-between items-start">
                                                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{note.title}</h3>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditNote(note)}
                                                        className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNote(note._id || note.id)}
                                                        className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            className={`h-4 w-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`}
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {note.category && (
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mb-2 ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                                                    {note.category}
                                                </span>
                                            )}

                                            {/* Content with Read More/Less feature */}
                                            <div
                                                className={`note-content-wrapper mb-3 ${expandedNoteId === (note._id || note.id) ? 'note-content-expanded' : 'note-content-collapsed'
                                                    }`}
                                            >
                                                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {note.content}
                                                </p>
                                            </div>

                                            {/* Only show button if content is long enough */}
                                            {note.content.split(' ').length > 30 && (
                                                <button
                                                    onClick={() => toggleExpand(note._id || note.id)}
                                                    className={`mt-2 text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                                        }`}
                                                >
                                                    {expandedNoteId === (note._id || note.id) ? 'Read Less' : 'Read More'}
                                                </button>
                                            )}
                                        </div> {/* End of content wrapper */}

                                        <div className={`mt-auto pt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}> {/* Added mt-auto and pt-2 for spacing */}
                                            {formatDate(note.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))

                        ) : (
                            <div className={`col-span-full flex flex-col items-center justify-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-xl font-medium">No notes found</p>
                                <p className="mt-1">Create your first note or try a different search</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Note Modal for Create/Edit */}
                {isModalOpen && (
                    <NoteModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveNote}
                        note={currentNote}
                        existingCategories={categories}
                        darkMode={darkMode}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </>
    );
}