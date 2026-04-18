import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setCookie } from '../utils/cookies';
import './Auth.css';

function Register({ login }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 10) {
            setError('Пароль должен быть не менее 10 символов');
            return;
        }

        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        // В реальном проекте тут был бы запрос на сервер
        // Для теста просто создаём фейкового пользователя
        const userData = {
            id: Date.now(),
            email,
            username: email.split('@')[0],
        };

        const token = btoa(JSON.stringify({
            userId: userData.id,
            email: userData.email,
            exp: Date.now() + 7 * 24 * 60 * 60 * 1000
        }));

        setCookie('catsgram_token', token, 7);
        setCookie('catsgram_user_data', JSON.stringify(userData), 7);

        login(userData);
        navigate('/feed');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <h1>CATSGRAM</h1>
                </div>

                <div className="auth-box">
                    <h2 className="auth-title">Создание аккаунта</h2>
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
                                    placeholder="Минимум 10 символов"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={10}
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

                        <p className="terms-text">
                            Продолжая, вы соглашаетесь с{' '}
                            <a href="#" className="terms-link">условиями использования</a>{' '}
                            и{' '}
                            <a href="#" className="terms-link">политикой конфиденциальности</a>
                        </p>

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Регистрация...' : 'Продолжить'}
                        </button>
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
        </div>
    );
}

export default Register;