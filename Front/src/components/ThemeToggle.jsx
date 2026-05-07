import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button className="theme-toggle" onClick={toggleTheme} title="Переключить тему">
            {theme === 'dark' ? (
                <span className="theme-icon">☀️</span>
            ) : (
                <span className="theme-icon">🌙</span>
            )}
        </button>
    );
}

export default ThemeToggle;