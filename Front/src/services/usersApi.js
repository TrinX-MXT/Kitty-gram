const API_BASE_URL = 'http://localhost:8080';


export async function getAllUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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

// Получение пользователя по ID
export async function getUserById(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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
            headers: {
                'Content-Type': 'application/json',
            },
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


export async function loginUser(email, password) {
    try {
        // Временно используем POST /users с фильтром
        // Потом заменим на /auth/login когда будет
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();

        // Ищем пользователя по email (временное решение)
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('Пользователь не найден');
        }

        // В реальности тут будет проверка пароля на бэкенде
        return {
            token: `token-${user.id}`,
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


export async function registerUser(email, password, username) {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                username, // Добавляем username
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();

        return {
            token: `token-${userData.id}`,
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


export async function updateUser(userId, userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: userId,
                ...userData,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        throw error;
    }
}