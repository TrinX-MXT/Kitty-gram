// Используем относительный путь — будет работать и напрямую, и через Vite proxy
const API_BASE_URL = 'http://localhost:8080';

// Проверка подключения через существующий эндпоинт
export async function checkBackendConnection() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        // Используем /posts?from=0&size=1 — возвращает массив
        const response = await fetch(`${API_BASE_URL}/users?from=0&size=1`, {
            method: 'GET',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            return Array.isArray(data);  // ✅ Теперь проверяем массив
        }

        return false;
    } catch (error) {
        console.log('Backend check failed, using mock data');
        return false;
    }
}

// Получение статистики дашборда
// Если бэкенд не имеет эндпоинта /dashboard/stats — собираем статистику из существующих
export async function fetchDashboardStats() {
    try {
        // Пробуем получить статистику с бэкенда (если эндпоинт есть)
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            method: 'GET',
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        // Эндпоинта нет или ошибка — собираем статистику вручную
    }

    // Фолбэк: собираем статистику из существующих эндпоинтов
    return await fetchStatsFromExistingEndpoints();
}

// Собираем статистику из доступных эндпоинтов
async function fetchStatsFromExistingEndpoints() {
    try {
        // Получаем пользователей и посты параллельно
        const [usersResponse, postsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/users`, { method: 'GET' }),
            fetch(`${API_BASE_URL}/posts?from=0&size=100`, { method: 'GET' }),
        ]);

        const users = usersResponse.ok ? await usersResponse.json() : [];
        const posts = postsResponse.ok ? await postsResponse.json() : [];

        // Считаем статистику
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        const newUsersToday = users.filter(u => {
            const regDate = new Date(u.registrationDate || u.createdAt);
            return regDate >= today;
        }).length;

        const newUsersMonth = users.filter(u => {
            const regDate = new Date(u.registrationDate || u.createdAt);
            return regDate >= monthAgo;
        }).length;

        const newUsersYear = users.filter(u => {
            const regDate = new Date(u.registrationDate || u.createdAt);
            return regDate >= yearAgo;
        }).length;

        // Активные пользователи = те, у кого есть посты
        const activeUsers = new Set(posts.map(p => p.authorId)).size;

        return {
            totalUsers: users.length,
            totalPosts: posts.length,
            newUsersToday,
            newUsersMonth,
            newUsersYear,
            activeUsers,
        };

    } catch (error) {
        console.error('Ошибка сбора статистики:', error);
        return getMockStats();
    }
}

// Получение данных для графика пользователей
export async function fetchUserGrowthData(period = 'month') {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/users/growth?period=${period}`, {
            method: 'GET',
        });

        if (response.ok) {
            return await response.json();
        }
    } catch {}

    // Фолбэк: генерируем данные из пользователей
    return await generateGrowthData('users', period);
}

// Получение данных для графика постов
export async function fetchPostsGrowthData(period = 'month') {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/posts/growth?period=${period}`, {
            method: 'GET',
        });

        if (response.ok) {
            return await response.json();
        }
    } catch {}

    // Фолбэк: генерируем данные из постов
    return await generateGrowthData('posts', period);
}

// Генерация данных для графика из реальных данных
async function generateGrowthData(type, period) {
    try {
        const endpoint = type === 'users' ? '/users' : '/posts?from=0&size=1000';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'GET' });

        if (!response.ok) return getMockGrowthData(period, type);

        const items = await response.json();
        const dateField = type === 'users' ? 'registrationDate' : 'postDate';

        // Группируем по периодам
        const groups = groupByPeriod(items, dateField, period);

        return {
            labels: groups.labels,
            datasets: [{
                label: type === 'users' ? 'Новые пользователи' : 'Новые посты',
                data: groups.values,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
            }],
        };
    } catch {
        return getMockGrowthData(period, type);
    }
}

// Группировка данных по периоду
function groupByPeriod(items, dateField, period) {
    const now = new Date();
    const groups = {};

    // Жёстко заданные метки для точного совпадения ключей
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

    items.forEach(item => {
        const date = new Date(item[dateField] || item.createdAt);
        if (isNaN(date)) return;

        let key;
        if (period === 'day') {
            // Группировка по каждому часу (00:00 - 23:00)
            key = date.getHours().toString().padStart(2, '0') + ':00';
        } else if (period === 'month') {
            const diffTime = now - date;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const weeksAgo = Math.floor(diffDays / 7);

            if (weeksAgo === 0) key = 'Эта нед';
            else if (weeksAgo === 1) key = 'Прош нед';
            else key = `${weeksAgo} нед назад`;
        } else if (period === 'year') {
            // ✅ Используем индекс месяца (0-11) вместо toLocaleDateString
            key = monthNames[date.getMonth()];
        }

        groups[key] = (groups[key] || 0) + 1;
    });

    const config = {
        day: Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0') + ':00'),
        month: ['Эта нед', 'Прош нед', '2 нед назад', '3 нед назад'],
        year: monthNames // Теперь ключи и метки гарантированно совпадают
    };

    const labels = config[period] || Object.keys(groups).sort();
    const values = labels.map(l => groups[l] || 0);

    return { labels, values };
}

// Моковые данные для крайнего случая
function getMockStats() {
    return {
        totalUsers: 12847,
        totalPosts: 45623,
        newUsersToday: 156,
        newUsersMonth: 3421,
        newUsersYear: 8934,
        activeUsers: 5632,
    };
}

function getMockGrowthData(period, type) {
    const config = {
        day: { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'] },
        month: { labels: ['1 нед', '2 нед', '3 нед', '4 нед'] },
        year: { labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'] },
    };

    const { labels } = config[period] || config.month;
    const baseValue = type === 'users' ? 100 : 200;

    return {
        labels,
        datasets: [{
            label: type === 'users' ? 'Новые пользователи' : 'Новые посты',
            data: labels.map(() => Math.floor(Math.random() * baseValue) + 50),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true,
        }],
    };
}