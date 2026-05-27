import React, { createContext, useState, useContext, useEffect } from 'react';
import { getPreference, setPreference } from '../utils/preferences';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Проверяем preference cookie
        const savedTheme = getPreference('theme');

        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // Проверяем системные настройки
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) {
            // Применяем тему и сохраняем в preference cookie
            document.documentElement.setAttribute('data-theme', theme);
            setPreference('theme', theme);
        }
    }, [theme, loaded]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};