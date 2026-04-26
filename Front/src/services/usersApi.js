const API_BASE_URL = 'http://localhost:8080';


export async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            token: data.token,
            user: {
                id: data.id,
                email: data.email,
                username: data.username,
            }
        };

    } catch (error) {
        console.error('Ошибка при входе:', error);
        throw error;
    }
}

export async function registerUser(email, password, username) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, username }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            token: data.token,
            user: {
                id: data.id,
                email: data.email,
                username: data.username,
            }
        };

    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        throw error;
    }
}

export async function getCurrentUser(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        throw error;
    }
}