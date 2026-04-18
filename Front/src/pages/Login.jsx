import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setCookie } from '../utils/cookies';
import testAccounts from '../data/test-accounts.json';
import './Auth.css';

function Login({ login }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Имитация задержки
        await new Promise(resolve => setTimeout(resolve, 500));

        // Поиск аккаунта в тестовых данных
        const account = testAccounts.accounts.find(
            acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );

        if (!account) {
            setError('Неверный email или пароль');
            setLoading(false);
            return;
        }

        // Генерация фейкового токена
        const token = btoa(JSON.stringify({
            userId: account.id,
            email: account.email,
            exp: Date.now() + 7 * 24 * 60 * 60 * 1000
        }));

        // Сохранение в cookies
        setCookie('catsgram_token', token, 7);
        setCookie('catsgram_user_data', JSON.stringify({
            id: account.id,
            email: account.email,
            username: account.username
        }), 7);

        // Вызываем login из props
        login({
            id: account.id,
            email: account.email,
            username: account.username
        });

        navigate('/feed');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <h1>CATSGRAM</h1>
                </div>

                <div className="auth-box">
                    <h2 className="auth-title">Вход</h2>
                    <p className="auth-subtitle">Пожалуйста, введите ваши данные</p>


                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">E-Mail</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="ilya@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Пароль</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Еще нет аккаунта?{' '}
                            <Link to="/register" className="auth-link">
                                Создать аккаунт
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;