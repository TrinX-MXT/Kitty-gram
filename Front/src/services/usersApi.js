const API_BASE_URL = 'http://localhost:8080';

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

/**
 * Вход: проверка только по email (временное решение для dev)
 * Пароль не проверяется так как бэкенд не возвращает его
 */
export async function loginUser(email, password) {
    try {
        // 1. Получаем всех пользователей с бэкенда
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();

        // 2. Ищем пользователя по email (регистронезависимо)
        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!user) {
            throw new Error('Пользователь не найден');
        }

        // 3. Пароль не проверяем (бэкенд его не возвращает)
        // ⚠️ Это временное решение только для разработки!

        // 4. Возвращаем данные пользователя + простой токен для сессии
        return {
            token: `dev_token_${user.id}_${Date.now()}`,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            }
        };

    } catch (error) {
        console.error('Ошибка при входе:', error);
        throw error;
    }
}

/**
 * Регистрация: отправляем данные на бэкенд
 */
export async function registerUser(email, password, username) {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                username,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();

        return {
            token: `dev_token_${userData.id}_${Date.now()}`,
            user: {
                id: userData.id,
                email: userData.email,
                username: userData.username,
            }
        };

    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        throw error;
    }
}

/**
 * Обновление пользователя
 */
export async function updateUser(userId, userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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