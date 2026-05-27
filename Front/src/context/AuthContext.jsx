import React, { createContext, useState, useContext, useEffect } from 'react';
import { setCookie, getCookie, removeCookie } from '../utils/cookies';
import { loginUser, registerUser } from '../services/usersApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Проверка авторизации при загрузке приложения
    useEffect(() => {
        const checkAuth = () => {
            const token = getCookie('catsgram_token');
            const userData = getCookie('catsgram_user_data');

            if (token && userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (e) {
                    console.error('Ошибка парсинга данных пользователя:', e);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Реальный вход через API
    const login = async (email, password) => {
        try {
            const response = await loginUser(email, password);

            // Сохраняем реальные данные от бэкенда
            setCookie('catsgram_token', response.token, 7);
            setCookie('catsgram_user_data', JSON.stringify(response.user), 7);

            setUser(response.user);
            return response.user;

        } catch (error) {
            console.error('Ошибка входа:', error);
            throw error; // Пробрасываем ошибку дальше для обработки в компоненте
        }
    };

    // Реальная регистрация через API
    const register = async (email, password, username) => {
        try {
            const response = await registerUser(email, password, username);

            // Сохраняем реальные данные от бэкенда
            setCookie('catsgram_token', response.token, 7);
            setCookie('catsgram_user_data', JSON.stringify(response.user), 7);

            setUser(response.user);
            return response.user;

        } catch (error) {
            console.error('Ошибка регистрации:', error);
            throw error; // Пробрасываем ошибку дальше для обработки в компоненте
        }
    };

    // Выход (остаётся без изменений)
    const logout = () => {
        setUser(null);
        removeCookie('catsgram_token');
        removeCookie('catsgram_user_data');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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