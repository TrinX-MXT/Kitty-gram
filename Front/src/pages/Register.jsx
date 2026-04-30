import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/usersApi';
import { setCookie } from '../utils/cookies';
import Toast from '../components/Toast';
import Button from '../components/Button';
import './Auth.css';
import logo from '../assets/logo.png';

function Register({ login }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // ← Добавлено
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 10) {
            setError('Пароль должен быть не менее 10 символов');
            return;
        }

        if (username.length < 3) {
            setError('Имя пользователя должно быть не менее 3 символов');
            return;
        }

        setLoading(true);

        try {
            // Реальный API с username
            const response = await registerUser(email, password, username);

            setCookie('catsgram_token', response.token, 7);
            setCookie('catsgram_user_data', JSON.stringify(response.user), 7);

            login(response.user);

            setToast({
                message: 'Аккаунт успешно создан!',
                type: 'success'
            });

            setTimeout(() => {
                navigate('/feed');
            }, 500);

        } catch (err) {
            console.error('Ошибка регистрации:', err);

            // Fallback - создаём локально
            const userData = {
                id: Date.now(),
                email,
                username,
            };

            const fakeToken = btoa(JSON.stringify({
                userId: userData.id,
                email: userData.email,
                exp: Date.now() + 7 * 24 * 60 * 60 * 1000
            }));

            setCookie('catsgram_token', fakeToken, 7);
            setCookie('catsgram_user_data', JSON.stringify(userData), 7);

            login(userData);

            setToast({
                message: 'Сервер недоступен. Аккаунт создан локально.',
                type: 'error'
            });

            setTimeout(() => {
                navigate('/feed');
            }, 500);

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
                    <h2 className="auth-title">Создание аккаунта</h2>
                    <p className="auth-subtitle">Пожалуйста, введите ваши данные</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Username поле */}
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="murzik_king"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                minLength={3}
                                disabled={loading}
                                autoComplete="username"
                            />
                        </div>

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
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Пароль</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Минимум 10 символов"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={10}
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    tabIndex={-1}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <p className="terms-text">
                            Продолжая, вы соглашаетесь с{' '}
                            <a href="#" className="terms-link">условиями использования</a>{' '}
                            и{' '}
                            <a href="#" className="terms-link">политикой конфиденциальности</a>
                        </p>

                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            className="auth-button"
                        >
                            Продолжить
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Уже есть аккаунт?{' '}
                            <Link to="/login" className="auth-link">
                                Войти
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

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

export default Register;