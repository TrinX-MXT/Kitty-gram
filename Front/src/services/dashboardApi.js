const API_BASE_URL = 'http://localhost:8080';

// Проверка подключения к серверу
export async function checkBackendConnection() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 сек таймаут

        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.error('Backend connection check failed:', error);
        return false;
    }
}

// Получение общей статистики
export async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
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
        console.error('Ошибка загрузки статистики:', error);
        throw error;
    }
}

// Получение данных для графика пользователей
export async function fetchUserGrowthData(period = 'month') {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/users/growth?period=${period}`, {
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
        console.error('Ошибка загрузки данных роста пользователей:', error);
        throw error;
    }
}

// Получение данных для графика постов
export async function fetchPostsGrowthData(period = 'month') {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/posts/growth?period=${period}`, {
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
        console.error('Ошибка загрузки данных роста постов:', error);
        throw error;
    }
}