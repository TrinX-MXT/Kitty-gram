import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Простая имитация входа
        setTimeout(() => {
            if (email && password.length >= 6) {
                const userData = {
                    username: email.split('@')[0],
                    email: email,
                    id: Date.now()
                };
                const token = 'fake-jwt-token-' + Date.now();

                login(userData, token, rememberMe);
                navigate('/feed');
            } else {
                setError('Неверный email или пароль (минимум 6 символов)');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <h1>🐱 Кэтсграмм</h1>
                </div>

                <div className="auth-box">
                    <h2>Вход</h2>
                    <p className="auth-subtitle">Пожалуйста, введите ваши данные</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>E-Mail</label>
                            <input
                                type="email"
                                placeholder="ilya@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Пароль</label>
                            <div className="password-input">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Запомнить меня на этом устройстве</span>
                            </label>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>

                    {/* Убрали ссылку на регистрацию */}
                </div>
            </div>
        </div>
    );
}

export default Login;