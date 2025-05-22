import React from 'react';
// Import React Router components for navigation and routing
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
// Import page components that will be rendered for different routes
import Home from './Home';
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
// Import authentication context to access user state and loading status
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
    // Extract user and loading state from authentication context
    // - user: contains user information when authenticated, null when not logged in
    // - loading: boolean that indicates if authentication state is being determined
    const { user, loading } = useAuth();

    // Show loading spinner while authentication status is being checked
    // This prevents flickering between authenticated and non-authenticated states
    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <>
            <main>
                <Routes>
                    {/* Home route - Protected */}
                    {/* If user is authenticated, show Home component; otherwise redirect to login */}
                    <Route path="/" element={
                        user ? <Home /> : <Navigate to="/login" />
                    } />
                    {/* Login route - Public with redirect */}
                    {/* If user is already authenticated, redirect to home; otherwise show login page */}
                    <Route path="/login" element={
                        user ? <Navigate to="/" /> : <Login />
                    } />
                    {/* Signup route - Public with redirect */}
                    {/* If user is already authenticated, redirect to home; otherwise show signup page */}
                    <Route path="/signup" element={
                        user ? <Navigate to="/" /> : <SignUp />
                    } />
                </Routes>
            </main>
        </>
    );
}