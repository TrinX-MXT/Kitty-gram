import React from 'react';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Layout from '../components/Layout.jsx';
import { useSettings } from './hooks/useSettings';
import '../styles/pages/Settings.css';

function Settings({ logout }) {
    const {
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        email,
        setEmail,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        handleSaveAccount,
        showDeleteModal,
        setShowDeleteModal,
        deleteCode,
        setDeleteCode,
        generatedCode,
        deleteLoading,
        handleDeleteAccount,
        toast,
        setToast,
    } = useSettings(logout);

    return (
        <Layout>
            <div className="settings-page">
                <div className="settings-container">
                    <h1 className="settings-title">⚙️ Настройки</h1>

                    {/* Табы */}
                    <div className="settings-tabs">
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

                {toast && (
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                )}
            </div>
        </Layout>
    );
}

export default Settings;