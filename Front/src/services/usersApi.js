import {getCookie, setCookie} from "../utils/cookies.js";

const API_BASE_URL = 'http://localhost:8080';
const token = getCookie('catsgram_token');

// ========== ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЕЙ ==========

export async function getAllUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        throw error;
    }
}

export async function getUserById(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        throw error;
    }
}

export async function getUserPosts(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/posts`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении постов пользователя:', error);
        throw error;
    }
}

// ========== АВТОРИЗАЦИЯ ==========

export async function loginUser(email, password) {
    // ✅ Правильный эндпоинт: /auth/login
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Ошибка входа');
    }

    const data = await response.json(); // { user: {...}, token: "jwt" }

    // Сохраняем токен и пользователя
    setCookie('catsgram_token', data.token, 7);
    setCookie('catsgram_user_data', JSON.stringify(data.user), 7);

    return data;
}

/**
 * Регистрация: отправляем данные на бэкенд
 */
export async function registerUser(email, password, username) {
    // ✅ Правильный эндпоинт: /auth/register
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Ошибка регистрации');
    }

    const data = await response.json(); // { user: {...}, token: "jwt" }

    // Сохраняем токен и пользователя
    setCookie('catsgram_token', data.token, 7);
    setCookie('catsgram_user_data', JSON.stringify(data.user), 7);

    return data;
}

/**
 * Обновление пользователя
 */
export async function updateUser(userId, userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`},
            body: JSON.stringify({
                id: userId,
                ...userData,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        throw error;
    }
}

export async function deleteUser(userId) {
    const token = getCookie('catsgram_token');

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Не удалось удалить аккаунт');
    }
}