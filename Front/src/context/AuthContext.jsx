import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверяем localStorage при загрузке
        const savedUser = localStorage.getItem('catsgram_user');
        const savedToken = localStorage.getItem('catsgram_token');

        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData, token, rememberMe) => {
        setUser(userData);

        if (rememberMe) {
            localStorage.setItem('catsgram_user', JSON.stringify(userData));
            localStorage.setItem('catsgram_token', token);
        } else {
            // Session storage - очистится при закрытии вкладки
            sessionStorage.setItem('catsgram_user', JSON.stringify(userData));
            sessionStorage.setItem('catsgram_token', token);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('catsgram_user');
        localStorage.removeItem('catsgram_token');
        sessionStorage.removeItem('catsgram_user');
        sessionStorage.removeItem('catsgram_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};