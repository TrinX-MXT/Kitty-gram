import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { getCookie, removeCookie } from './utils/cookies';
import ThemeToggle from './components/ThemeToggle';
import ProtectedRoute from './components/ProtectedRoute';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import './App.css';
import Dashboard from "./pages/Dashboard.jsx";
import About from "./pages/About.jsx";
import Loader from "./components/Loader.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import PostPage from "./pages/PostPage.jsx";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getCookie('catsgram_token');
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    const login = (userData) => {
        setIsAuthenticated(true);
    };

    const logout = () => {
        setIsAuthenticated(false);
        removeCookie('catsgram_token');
        removeCookie('catsgram_user_data');
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    {/* Публичные роуты */}
                    <Route path="/login" element={<Login login={login} />} />
                    <Route path="/register" element={<Register login={login} />} />
                    <Route path="/about" element={<About />} />

                    {/* Защищённые роуты */}
                    <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                        <Route path="/" element={<Feed logout={logout} />} />
                        <Route path="/feed" element={<Feed logout={logout} />} />
                        <Route path="/settings" element={<Settings logout={logout} />} />
                        <Route path="/dashboard" element={<Dashboard logout={logout}/>} />

                        {/* Профиль через /u/:username */}
                        <Route path="/u/:username" element={<Profile />} />
                        <Route path="/post/:postId" element={<PostPage />} />
                    </Route>

                    {/* Страницы ошибок */}
                    <Route path="/error" element={<ServerError />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;