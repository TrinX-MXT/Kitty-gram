import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/usersApi';
import { setCookie } from '../utils/cookies';
import Toast from '../components/Toast';
import '../styles/pages/Auth.css';
import logo from '../assets/logo.png';
import Loader from "../components/Loader.jsx";

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

            // Сохраняем токен и данные пользователя
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
            setError('Неверный email или пароль');
            setToast({
                message: 'Ошибка входа: ' + err.message,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <img src={logo} alt="Catsgram Logo" className="logo-image" />
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