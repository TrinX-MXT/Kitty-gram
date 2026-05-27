import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getCookie, setCookie} from '../utils/cookies';
import Button from '../components/Button';
import Toast from '../components/Toast';
import '../styles/pages/Settings.css';
import Layout from "../components/Layout.jsx";
import {deleteUser} from "../services/usersApi.js";

function Settings({logout}) {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('account');
    const [toast, setToast] = useState(null);

    // Account tab state
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteCode, setDeleteCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        // Загружаем данные пользователя
        const userData = getCookie('catsgram_user_data');
        if (userData) {
            const user = JSON.parse(userData);
            setEmail(user.email || '');
        }
        // Генерируем код для удаления
        generateDeleteCode();
    }, []);

    const generateDeleteCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 16; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setGeneratedCode(code);
    };

    const handleSaveAccount = async () => {
        try {
            const userData = getCookie('catsgram_user_data');
            if (!userData) throw new Error('Пользователь не авторизован');

            const user = JSON.parse(userData);

            // Обновление email
            if (email !== user.email) {
                const response = await fetch('http://localhost:8080/users', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id, email }),
                });
                if (!response.ok) throw new Error('Не удалось обновить email');

                // Обновляем cookie
                const updatedUser = { ...user, email };
                setCookie('catsgram_user_data', JSON.stringify(updatedUser), 7);
            }

            // Смена пароля
            if (newPassword) {
                if (newPassword.length < 10) {
                    throw new Error('Пароль должен быть не менее 10 символов');
                }
                if (newPassword !== confirmPassword) {
                    throw new Error('Пароли не совпадают');
                }

                const response = await fetch(`http://localhost:8080/users/${user.id}/password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
                });
                if (!response.ok) throw new Error('Не удалось сменить пароль');
            }

            setToast({ message: 'Настройки сохранены!', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Вы уверены? Это действие нельзя отменить.')) {
            return;
        }

        try {
            //тут берём id из куки
            const userData = JSON.parse(getCookie('catsgram_user_data'));
            const userId = userData?.id;

            if (!userId) {
                throw new Error('Пользователь не авторизован');
            }

            // удаление акка из апи
            await deleteUser(userId);


            alert('Аккаунт успешно удалён');
            logout();
            navigate('/login', { replace: true });


        } catch (error) {
            console.error('Ошибка при удалении аккаунта:', error);
            alert('Не удалось удалить аккаунт: ' + error.message);
        }
    };

    return (
        <Layout>
        <div className="settings-page">
            <div className="settings-container">
                <h1 className="settings-title">⚙️ Настройки</h1>

                {/* Табы */}
                <div className="settings-tabs">

                    {/*<button
                        className={`tab ${activeTab === 'account' ? 'active' : ''}`}
                        onClick={() => setActiveTab('account')}
                    >
                        👤 Аккаунт
                    </button>*/}
                    <button
                        className={`tab ${activeTab === 'theme' ? 'active' : ''}`}
                        onClick={() => setActiveTab('theme')}
                    >
                        🎨 Темы
                    </button>
                    <button
                        className={`tab ${activeTab === 'danger' ? 'active' : ''}`}
                        onClick={() => setActiveTab('danger')}
                    >
                        ⚠️ Опасная зона
                    </button>
                </div>

                {/* Контент табов */}
                <div className="settings-content">
                    {/* Аккаунт */}
                    {activeTab === 'account' && (
                        <div className="tab-content">
                            <div className="form-group">
                                <label>E-Mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Текущий пароль</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="form-group">
                                <label>Новый пароль</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Минимум 10 символов"
                                />
                            </div>

                            <div className="form-group">
                                <label>Подтвердите пароль</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <Button variant="primary" onClick={handleSaveAccount}>
                                Сохранить изменения
                            </Button>
                        </div>
                    )}

                    {/* Темы */}
                    {activeTab === 'theme' && (
                        <div className="tab-content">
                            <div className="theme-options">
                                <div
                                    className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                                    onClick={() => setTheme('light')}
                                >
                                    <div className="theme-preview light">☀️</div>
                                    <h3>Светлая</h3>
                                    <p>Классический светлый интерфейс</p>
                                </div>

                                <div
                                    className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => setTheme('dark')}
                                >
                                    <div className="theme-preview dark">🌙</div>
                                    <h3>Тёмная</h3>
                                    <p>Комфортный тёмный интерфейс</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Опасная зона */}
                    {activeTab === 'danger' && (
                        <div className="tab-content danger-zone">
                            <div className="danger-card">
                                <h3>🗑️ Удаление аккаунта</h3>
                                <p>Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены.</p>
                                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                                    Удалить аккаунт
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно удаления */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>⚠️ Вы уверены?</h2>
                        <p>Это действие нельзя отменить. Для подтверждения введите код:</p>

                        <div className="form-group">
                            <label>Код подтверждения</label>
                            <div
                                className="delete-code"
                                onCopy={(e) => e.preventDefault()}
                                onCut={(e) => e.preventDefault()}
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                {generatedCode}
                            </div>
                            <input
                                type="text"
                                value={deleteCode}
                                onChange={(e) => setDeleteCode(e.target.value)}
                                placeholder="Введите код"
                                autoComplete="off"
                            />
                        </div>

                        <div className="modal-buttons">
                            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                Отмена
                            </Button>
                            <Button
                                variant="danger"
                                loading={deleteLoading}
                                onClick={handleDeleteAccount}
                            >
                                Да, удалить
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Уведомление */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
        </Layout>
    );
}

export default Settings;