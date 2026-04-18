import React, { createContext, useState, useContext, useEffect } from 'react';
import testAccounts from '../data/test-accounts.json';
import { setCookie, getCookie, removeCookie } from '../utils/cookies';

const AuthContext = createContext(null);

// Фейковая генерация JWT токена
const generateFakeToken = (userId, email) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        userId,
        email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 дней
    }));
    const signature = btoa('fake-signature-' + userId);
    return `${header}.${payload}.${signature}`;
};

// Проверка валидности токена (фейковая)
const validateToken = (token) => {
    if (!token) return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        const payload = JSON.parse(atob(parts[1]));
        // Проверяем не истёк ли токен
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
};

// Получение данных из токена
const getTokenData = (token) => {
    try {
        const parts = token.split('.');
        return JSON.parse(atob(parts[1]));
    } catch (e) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверяем токен при загрузке
        const token = getCookie('catsgram_token');
        if (token && validateToken(token)) {
            const tokenData = getTokenData(token);
            const userData = getCookie('catsgram_user_data');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 800));

        // Ищем аккаунт в тестовых данных
        const account = testAccounts.accounts.find(
            acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );

        if (!account) {
            throw new Error('Неверный email или пароль');
        }

        // Генерируем токен
        const token = generateFakeToken(account.id, account.email);
        const userData = {
            id: account.id,
            email: account.email,
            username: account.username,
        };

        // Сохраняем в cookies
        setCookie('catsgram_token', token, 7);
        setCookie('catsgram_user_data', JSON.stringify(userData), 7);

        setUser(userData);
        return userData;
    };

    const register = async (email, password, username) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Проверяем есть ли уже такой email
        const existingAccount = testAccounts.accounts.find(
            acc => acc.email.toLowerCase() === email.toLowerCase()
        );

        if (existingAccount) {
            throw new Error('Аккаунт с таким email уже существует');
        }

        // В реальном проекте тут был бы запрос на сервер
        // Для теста просто создаём новый аккаунт в памяти
        const newAccount = {
            id: testAccounts.accounts.length + 1,
            email,
            password,
            username: username || email.split('@')[0],
            createdAt: new Date().toISOString()
        };

        // Генерируем токен
        const token = generateFakeToken(newAccount.id, email);
        const userData = {
            id: newAccount.id,
            email: newAccount.email,
            username: newAccount.username,
        };

        setCookie('catsgram_token', token, 7);
        setCookie('catsgram_user_data', JSON.stringify(userData), 7);

        setUser(userData);
        return userData;
    };

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