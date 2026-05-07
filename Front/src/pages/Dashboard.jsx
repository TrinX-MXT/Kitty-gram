import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
    checkBackendConnection,
    fetchDashboardStats,
    fetchUserGrowthData,
    fetchPostsGrowthData,
} from '../services/dashboardApi';
import { useTheme } from '../context/ThemeContext';
import './Dashboard.css';
import Loader from "../components/Loader.jsx";

// Регистрация компонентов Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function Dashboard() {
    const { theme } = useTheme();
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [stats, setStats] = useState(null);
    const [userGrowth, setUserGrowth] = useState(null);
    const [postsGrowth, setPostsGrowth] = useState(null);
    const [userPeriod, setUserPeriod] = useState('month');
    const [postsPeriod, setPostsPeriod] = useState('month');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Проверка подключения и загрузка данных
    useEffect(() => {
        loadData();
    }, []);

    // Перезагрузка при смене периода
    useEffect(() => {
        if (connectionStatus === 'active') {
            loadGrowthData();
        }
    }, [userPeriod, postsPeriod]);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Проверка подключения
            const isConnected = await checkBackendConnection();
            setConnectionStatus(isConnected ? 'active' : 'inactive');

            if (isConnected) {
                // Загрузка статистики
                const [statsData, userData, postsData] = await Promise.all([
                    fetchDashboardStats(),
                    fetchUserGrowthData(userPeriod),
                    fetchPostsGrowthData(postsPeriod),
                ]);

                setStats(statsData);
                setUserGrowth(userData);
                setPostsGrowth(postsData);
            } else {
                // Мок-данные для демонстрации
                setMockData();
            }
        } catch (err) {
            console.error('Ошибка загрузки дашборда:', err);
            setError('Не удалось загрузить данные');
            setConnectionStatus('inactive');
            setMockData();
        } finally {
            setLoading(false);
        }
    };

    const loadGrowthData = async () => {
        if (connectionStatus !== 'active') return;

        try {
            const [userData, postsData] = await Promise.all([
                fetchUserGrowthData(userPeriod),
                fetchPostsGrowthData(postsPeriod),
            ]);
            setUserGrowth(userData);
            setPostsGrowth(postsData);
        } catch (err) {
            console.error('Ошибка загрузки графиков:', err);
        }
    };

    // Мок-данные для демонстрации
    const setMockData = () => {
        setStats({
            totalUsers: 12847,
            totalPosts: 45623,
            newUsersToday: 156,
            newUsersMonth: 3421,
            newUsersYear: 8934,
            activeUsers: 5632,
        });

        setUserGrowth(generateMockGrowthData(userPeriod, 'users'));
        setPostsGrowth(generateMockGrowthData(postsPeriod, 'posts'));
    };

    const generateMockGrowthData = (period, type) => {
        const config = {
            day: { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'], points: 6 },
            month: { labels: ['1 нед', '2 нед', '3 нед', '4 нед'], points: 4 },
            year: { labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'], points: 12 },
        };

        const { labels, points } = config[period] || config.month;
        const baseValue = type === 'users' ? 100 : 200;

        return {
            labels,
            datasets: [
                {
                    label: type === 'users' ? 'Новые пользователи' : 'Новые посты',
                    data: labels.map(() => Math.floor(Math.random() * baseValue) + 50),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true,
                },
            ],
        };
    };

    // Настройки графиков
    const getChartOptions = (title) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: title,
                color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                font: {
                    size: 16,
                    weight: '600',
                },
            },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                titleColor: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                bodyColor: theme === 'dark' ? '#e0e0e0' : '#333333',
                borderColor: 'var(--border-color)',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: {
                    color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
                ticks: {
                    color: theme === 'dark' ? '#888888' : '#666666',
                },
            },
            y: {
                grid: {
                    color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
                ticks: {
                    color: theme === 'dark' ? '#888888' : '#666666',
                },
                beginAtZero: true,
            },
        },
    });

    // Форматирование чисел
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                {/* Заголовок */}
                <div className="dashboard-header">
                    <h1>📊 Статистика сайта</h1>

                    {/* Индикатор подключения */}
                    <div className={`connection-indicator ${connectionStatus}`}>
                        <span className={`status-dot ${connectionStatus}`}></span>
                        <span className="status-text">
              {connectionStatus === 'active' ? 'Backend: Active' :
                  connectionStatus === 'checking' ? 'Backend: Checking...' :
                      'Backend: Not Active'}
            </span>
                        {connectionStatus === 'inactive' && (
                            <button className="retry-btn" onClick={loadData}>
                                🔄 Повторить
                            </button>
                        )}
                    </div>
                </div>

                {/* Карточки статистики */}
                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <span className="stat-value">{formatNumber(stats.totalUsers)}</span>
                                <span className="stat-label">Всего пользователей</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📝</div>
                            <div className="stat-content">
                                <span className="stat-value">{formatNumber(stats.totalPosts)}</span>
                                <span className="stat-label">Всего постов</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">🔥</div>
                            <div className="stat-content">
                                <span className="stat-value">{formatNumber(stats.activeUsers)}</span>
                                <span className="stat-label">Активных сейчас</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Новые пользователи */}
                <div className="stats-section">
                    <h3>📈 Новые пользователи</h3>

                    <div className="period-selector">
                        <button
                            className={userPeriod === 'day' ? 'active' : ''}
                            onClick={() => setUserPeriod('day')}
                        >
                            За день
                        </button>
                        <button
                            className={userPeriod === 'month' ? 'active' : ''}
                            onClick={() => setUserPeriod('month')}
                        >
                            За месяц
                        </button>
                        <button
                            className={userPeriod === 'year' ? 'active' : ''}
                            onClick={() => setUserPeriod('year')}
                        >
                            За год
                        </button>
                    </div>

                    <div className="stats-summary">
                        <div className="summary-item">
                            <span className="summary-value">{formatNumber(stats?.newUsersToday || 0)}</span>
                            <span className="summary-label">Сегодня</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-value">{formatNumber(stats?.newUsersMonth || 0)}</span>
                            <span className="summary-label">За месяц</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-value">{formatNumber(stats?.newUsersYear || 0)}</span>
                            <span className="summary-label">За год</span>
                        </div>
                    </div>

                    <div className="chart-container">
                        {userGrowth && (
                            <Line
                                data={userGrowth}
                                options={getChartOptions('')}
                            />
                        )}
                    </div>
                </div>

                {/* Новые посты */}
                <div className="stats-section">
                    <h3>📝 Новые посты</h3>

                    <div className="period-selector">
                        <button
                            className={postsPeriod === 'day' ? 'active' : ''}
                            onClick={() => setPostsPeriod('day')}
                        >
                            За день
                        </button>
                        <button
                            className={postsPeriod === 'month' ? 'active' : ''}
                            onClick={() => setPostsPeriod('month')}
                        >
                            За месяц
                        </button>
                        <button
                            className={postsPeriod === 'year' ? 'active' : ''}
                            onClick={() => setPostsPeriod('year')}
                        >
                            За год
                        </button>
                    </div>

                    <div className="chart-container chart-large">
                        {postsGrowth && (
                            <Bar
                                data={postsGrowth}
                                options={getChartOptions('')}
                            />
                        )}
                    </div>
                </div>

                {/* Ошибка */}
                {error && (
                    <div className="error-banner">
                        ⚠️ {error}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;