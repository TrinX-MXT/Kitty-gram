import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/usersApi';
import { setCookie } from '../utils/cookies';
import Toast from '../components/Toast';
import testAccounts from '../data/test-accounts.json';
import './Auth.css';
import logo from '../assets/logo.png';

function Login({ login }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await loginUser(email, password);

            //cookies
            setCookie('catsgram_token', response.token, 7);
            setCookie('catsgram_user_data', JSON.stringify(response.user), 7);

            // Вызываем login из props
            login(response.user);

            setToast({
                message: 'Успешный вход!',
                type: 'success'
            });

            // Редирект
            setTimeout(() => {
                navigate('/feed');
            }, 500);

        } catch (err) {
            console.error('Ошибка входа:', err);

            // Fallback на тестовые данные
            const testAccount = testAccounts.accounts.find(
                acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
            );

            if (testAccount) {
                console.log('API не работает, используем тестовый аккаунт');

                const fakeToken = btoa(JSON.stringify({
                    userId: testAccount.id,
                    email: testAccount.email,
                    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
                }));

                setCookie('catsgram_token', fakeToken, 7);
                setCookie('catsgram_user_data', JSON.stringify({
                    id: testAccount.id,
                    email: testAccount.email,
                    username: testAccount.username
                }), 7);

                login({
                    id: testAccount.id,
                    email: testAccount.email,
                    username: testAccount.username
                });

                setToast({
                    message: 'Сервер недоступен. Вход выполнен в тестовом режиме.',
                    type: 'error'
                });

                setTimeout(() => {
                    navigate('/feed');
                }, 500);

            } else {
                setError('Неверный email или пароль');
                setToast({
                    message: 'Ошибка входа: ' + err.message,
                    type: 'error'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <img src={logo} alt="Catsgram Logo" className="logo-image" />
                </div>

                <div className="auth-box">
                    <h2 className="auth-title">Вход</h2>
                    <p className="auth-subtitle">Пожалуйста, введите ваши данные</p>

                    <div className="test-accounts-hint">
                        <p>Тестовый аккаунт:</p>
                        <code>test@example.com / password123</code>
                    </div>

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
                                disabled={loading}
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
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
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

            {/* Уведомление (Toast) */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

export default Login;