import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { getCookie, setCookie } from '../../utils/cookies';
import { deleteUser } from '../../services/usersApi.js';

// ─── Утилиты ────────────────────────────────────────────────────────────────

function generateDeleteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function getCurrentUser() {
    const userData = getCookie('catsgram_user_data');
    return userData ? JSON.parse(userData) : null;
}

// ─── Кастомный хук ───────────────────────────────────────────────────────────

export function useSettings(logout) {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const [activeTab, setActiveTab] = useState('theme');
    const [toast, setToast] = useState(null);

    // Account tab
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Delete account
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteCode, setDeleteCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        if (user) setEmail(user.email || '');
        setGeneratedCode(generateDeleteCode());
    }, []);

    // ── Сохранение настроек аккаунта ─────────────────────────────────────────

    const handleSaveAccount = async () => {
        try {
            const user = getCurrentUser();
            if (!user) throw new Error('Пользователь не авторизован');

            if (email !== user.email) {
                const res = await fetch('http://localhost:8080/users', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id, email }),
                });
                if (!res.ok) throw new Error('Не удалось обновить email');
                setCookie('catsgram_user_data', JSON.stringify({ ...user, email }), 7);
            }

            if (newPassword) {
                if (newPassword.length < 10) throw new Error('Пароль должен быть не менее 10 символов');
                if (newPassword !== confirmPassword) throw new Error('Пароли не совпадают');

                const res = await fetch(`http://localhost:8080/users/${user.id}/password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
                });
                if (!res.ok) throw new Error('Не удалось сменить пароль');
            }

            setToast({ message: 'Настройки сохранены!', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        }
    };

    // ── Удаление аккаунта ────────────────────────────────────────────────────

    const handleDeleteAccount = async () => {
        if (!window.confirm('Вы уверены? Это действие нельзя отменить.')) return;

        try {
            const user = getCurrentUser();
            if (!user?.id) throw new Error('Пользователь не авторизован');

            setDeleteLoading(true);
            await deleteUser(user.id);

            alert('Аккаунт успешно удалён');
            logout();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Ошибка при удалении аккаунта:', error);
            alert('Не удалось удалить аккаунт: ' + error.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    return {
        // Тема
        theme,
        setTheme,

        // Табы
        activeTab,
        setActiveTab,

        // Аккаунт
        email,
        setEmail,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        handleSaveAccount,

        // Удаление
        showDeleteModal,
        setShowDeleteModal,
        deleteCode,
        setDeleteCode,
        generatedCode,
        deleteLoading,
        handleDeleteAccount,

        // Toast
        toast,
        setToast,
    };
}