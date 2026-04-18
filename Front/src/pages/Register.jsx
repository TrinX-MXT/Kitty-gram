import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <h1>CATSGRAM</h1>
                </div>

                <div className="auth-box">
                    <h2 className="auth-title">Создание аккаунта</h2>
                    <p className="auth-subtitle">Пожалуйста, введите ваши данные</p>

                    <form className="auth-form">
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

                        <p className="terms-text">
                            Продолжая, вы соглашаетесь с{' '}
                            <a href="#" className="terms-link">условиями использования</a>{' '}
                            и{' '}
                            <a href="#" className="terms-link">политикой конфиденциальности</a>
                        </p>

                        <button type="submit" className="auth-button">
                            Продолжить
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