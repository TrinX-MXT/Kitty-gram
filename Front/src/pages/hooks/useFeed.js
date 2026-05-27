import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {deletePost, fetchPosts, updatePost} from '../../services/postsApi.js';
import { getCookie } from '../../utils/cookies.js';
import { addLike, removeLike, hasUserLikedPost } from '../../services/likesApi.js';

const MAX_CHARACTERS = 1000;
const MAX_VISIBLE_LINES = 10;
const PAGE_SIZE = 10;
const API_BASE = 'http://localhost:8080';

// ─── Утилиты ────────────────────────────────────────────────────────────────

export function formatCount(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

export function formatPostDate(isoString) {
    if (!isoString) return '3 дн.';
    const date = new Date(isoString);
    const diffMs = Date.now() - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Только что';
    if (diffHours < 24) return `${diffHours} ч.`;
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн.`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function getLineCount(text) {
    return text ? text.split('\n').length : 0;
}

export function getTruncatedText(text, maxLines) {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.length <= maxLines ? text : lines.slice(0, maxLines).join('\n');
}

function getCurrentUserId() {
    const userData = getCookie('catsgram_user_data');
    return userData ? JSON.parse(userData).id : null;
}

// ─── Маппер поста из API → модель UI ────────────────────────────────────────

async function enrichPost(post) {
    let author = null;
    try {
        const res = await fetch(`${API_BASE}/users/${post.authorId}`);
        if (res.ok) author = await res.json();
    } catch { /* автор недоступен */ }

    let imageUrl = null;
    try {
        const res = await fetch(`${API_BASE}/posts/${post.id}/images`);
        if (res.ok) {
            const images = await res.json();
            if (images[0]?.id) imageUrl = `${API_BASE}/images/${images[0].id}`;
        }
    } catch { /* изображение недоступно */ }

    let likes = 0, comments = 0;
    try {
        const [likesRes, commentsRes] = await Promise.all([
            fetch(`${API_BASE}/posts/${post.id}/likes`),
            fetch(`${API_BASE}/posts/${post.id}/comments`),
        ]);
        if (likesRes.ok) likes = (await likesRes.json()).length;
        if (commentsRes.ok) comments = (await commentsRes.json()).length;
    } catch { /* статистика недоступна */ }

    return {
        id: post.id,
        authorId: post.authorId,
        text: post.description,
        createdAt: post.postDate,
        time: formatPostDate(post.postDate),
        username: author?.username || `User${post.authorId}`,
        avatar: author?.avatar || null,
        verified: author?.verified || false,
        likes,
        comments,
        imageUrl,
    };
}

// ─── Кастомный хук ──────────────────────────────────────────────────────────

export function useFeed(logout) {
    const navigate = useNavigate();

    // Рефы
    const emojiBtnRef = useRef(null);
    const fileInputRef = useRef(null);
    const textInputRef = useRef(null);

    // Состояние постов
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState({});
    const [expandedPosts, setExpandedPosts] = useState({});
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Состояние нового поста
    const [newPostText, setNewPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    // UI-состояние
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [showMenuPostId, setShowMenuPostId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    // ── Загрузка лайков для массива постов ──────────────────────────────────

    async function loadLikedStatuses(postList) {
        const userId = getCurrentUserId();
        if (!userId) return;

        const statuses = {};
        await Promise.all(
            postList.map(async (post) => {
                try {
                    statuses[post.id] = await hasUserLikedPost(post.id, userId);
                } catch {
                    statuses[post.id] = false;
                }
            })
        );
        setLikedPosts(prev => ({ ...prev, ...statuses }));
    }

    // ── Первичная загрузка постов ────────────────────────────────────────────

    const loadPosts = async () => {
        setLoading(true);
        try {
            const fetched = await fetchPosts();
            if (!fetched?.length) { setPosts([]); return; }

            await loadLikedStatuses(fetched);
            setPosts(fetched);
        } catch (error) {
            console.error('Ошибка загрузки постов:', error);
            setPosts([]);
            setToast({ message: 'Не удалось загрузить посты', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ── Подгрузка следующей страницы ─────────────────────────────────────────

    const loadMorePosts = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);

        const nextPage = page + 1;
        try {
            const res = await fetch(
                `${API_BASE}/posts?from=${nextPage * PAGE_SIZE}&size=${PAGE_SIZE}&sort=desc`
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const rawPosts = await res.json();
            if (rawPosts.length < PAGE_SIZE) setHasMore(false);
            if (!rawPosts.length) return;

            const newPosts = await Promise.all(rawPosts.map(enrichPost));
            setPosts(prev => [...prev, ...newPosts]);
            setPage(nextPage);
            await loadLikedStatuses(newPosts);
        } catch (error) {
            console.error('Ошибка загрузки дополнительных постов:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    // ── Публикация нового поста ──────────────────────────────────────────────

    const handlePublish = async () => {
        if (!newPostText.trim() && !selectedImage) {
            setToast({ message: 'Напишите что-нибудь', type: 'error' });
            return;
        }

        const userId = getCurrentUserId();
        if (!userId) {
            setToast({ message: 'Необходимо войти для публикации', type: 'error' });
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authorId: userId, description: newPostText }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

            const newPost = await res.json();

            // автор
            let authorData = null;
            try {
                const authorRes = await fetch(`${API_BASE}/users/${userId}`);
                if (authorRes.ok) authorData = await authorRes.json();
            } catch { /* данные автора недоступны */ }

            // Загружаем изображение
            let imageUrl = null;
            if (selectedImage?.file) {
                try {
                    const formData = new FormData();
                    formData.append('image', selectedImage.file);
                    const imgRes = await fetch(`${API_BASE}/posts/${newPost.id}/images`, {
                        method: 'POST',
                        body: formData,
                    });
                    if (imgRes.ok) {
                        const images = await imgRes.json();
                        if (images[0]?.id) imageUrl = `${API_BASE}/images/${images[0].id}`;
                    }
                } catch { console.warn('Не удалось загрузить изображение'); }
            }

            const postForFeed = {
                id: newPost.id,
                authorId: newPost.authorId,
                text: newPost.description,
                createdAt: newPost.postDate,
                time: formatPostDate(newPost.postDate),
                username: authorData?.username || `User${userId}`,
                avatar: authorData?.avatar || null,
                verified: authorData?.verified || false,
                likes: 0,
                comments: 0,
                imageUrl,
            };

            setPosts(prev => [postForFeed, ...prev]);
            setNewPostText('');
            handleRemoveImage();
            setToast({ message: 'Пост опубликован.', type: 'success' });
        } catch (error) {
            console.error('Ошибка публикации:', error);
            setToast({ message: 'Не удалось опубликовать пост', type: 'error' });
        }
    };

    // ── Лайки ───────────────────────────────────────────────────────────────

    const handleLikeToggle = async (postId) => {
        const userId = getCurrentUserId();
        if (!userId) {
            setToast({ message: 'Необходимо войти для лайков', type: 'error' });
            return;
        }

        const isLiked = likedPosts[postId] ?? false;
        try {
            if (isLiked) {
                await removeLike(postId, userId);
                setLikedPosts(prev => ({ ...prev, [postId]: false }));
                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, likes: Math.max(0, (p.likes || 0) - 1) } : p
                ));
            } else {
                await addLike(postId, userId);
                setLikedPosts(prev => ({ ...prev, [postId]: true }));
                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
                ));
            }
        } catch (error) {
            console.error('Ошибка при переключении лайка:', error);
            setToast({ message: 'Не удалось обновить лайк', type: 'error' });
        }
    };

    // ── Удаление и редактирование поста ─────────────────────────────────────

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Вы уверены что хотите удалить пост?')) return;
        try {
            await deletePost(postId);
        } catch {
            setToast({ message: 'Ошибка при удалении поста', type: 'error' });
        }
        setShowMenuPostId(null);
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
        setShowEditModal(true);
        setShowMenuPostId(null);
    };

    const handleEditUpdate = async (updatedData) => {
        try {
            // ✅ Modal возвращает { text: "..." }, но бэкенд ждёт description
            const description = updatedData.text;  // ← Берём text из модалки

            if (!description) {
                throw new Error('Текст поста не может быть пустым');
            }

            // ✅ Отправляем запрос на бэкенд
            await updatePost(editingPost.id, description);  // ← Передаём description

            // ✅ Обновляем локальный стейт
            setPosts(prev => prev.map(p =>
                p.id === editingPost.id ? { ...p, text: description } : p
            ));

            setShowEditModal(false);
            setEditingPost(null);
            setToast({ message: 'Пост обновлён!', type: 'success' });

        } catch (error) {
            console.error('Ошибка обновления:', error);
            setToast({ message: 'Не удалось обновить пост: ' + error.message, type: 'error' });
        }
    };

    const handleEditClose = () => {
        setShowEditModal(false);
        setEditingPost(null);
    };

    // ── Копирование ссылки ───────────────────────────────────────────────────

    const handleCopyLink = async (postId) => {
        const url = `${window.location.origin}/post/${postId}`;
        try {
            await navigator.clipboard.writeText(url);
            setToast({ message: 'Ссылка скопирована!', type: 'success' });
        } catch {
            setToast({ message: 'Не удалось скопировать ссылку', type: 'error' });
        }
        setShowMenuPostId(null);
    };

    // ── Работа с изображением ────────────────────────────────────────────────

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedImage({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
        });
    };

    const handleRemoveImage = () => {
        if (selectedImage?.preview) URL.revokeObjectURL(selectedImage.preview);
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAttachmentClick = () => fileInputRef.current?.click();

    // ── Работа с текстом и эмодзи ────────────────────────────────────────────

    const handleTextChange = (e) => {
        if (e.target.value.length <= MAX_CHARACTERS) setNewPostText(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            if (newPostText.trim() || selectedImage) handlePublish();
        }
    };

    const handleEmojiClick = (emoji) => {
        const textarea = textInputRef.current;
        if (MAX_CHARACTERS - newPostText.length < emoji.length) return;

        if (textarea) {
            const { selectionStart: start, selectionEnd: end } = textarea;
            const newText = newPostText.slice(0, start) + emoji + newPostText.slice(end);
            if (newText.length <= MAX_CHARACTERS) {
                setNewPostText(newText);
                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + emoji.length, start + emoji.length);
                }, 0);
            }
        } else if ((newPostText + emoji).length <= MAX_CHARACTERS) {
            setNewPostText(newPostText + emoji);
        }
        setShowEmojiPicker(false);
    };

    // ── Раскрытие постов ─────────────────────────────────────────────────────

    const togglePostExpand = (postId) => {
        setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    // ── Выход ────────────────────────────────────────────────────────────────

    const handleLogoutClick = () => setShowLogoutModal(true);
    const handleLogoutCancel = () => setShowLogoutModal(false);
    const handleLogoutConfirm = () => {
        logout?.();
        setShowLogoutModal(false);
        window.location.href = '/login';
    };

    // ── Эффекты ──────────────────────────────────────────────────────────────

    useEffect(() => { loadPosts(); }, []);

    // Авто-resize textarea
    useEffect(() => {
        if (textInputRef.current) {
            textInputRef.current.style.height = 'auto';
            textInputRef.current.style.height =
                Math.min(textInputRef.current.scrollHeight, 150) + 'px';
        }
    }, [newPostText]);

    // Бесконечный скролл
    useEffect(() => {
        const handleScroll = () => {
            const nearBottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.offsetHeight - 300;
            if (nearBottom && hasMore && !loadingMore) loadMorePosts();
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [page, hasMore, loadingMore]);

    // Закрытие дропдаунов кликом вне
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.emoji-picker-container') &&
                !e.target.closest('.emoji-picker-portal')) {
                setShowEmojiPicker(false);
            }
            if (!e.target.closest('.menu-container')) {
                setShowMenuPostId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // ── Производные значения ─────────────────────────────────────────────────

    const remainingChars = MAX_CHARACTERS - newPostText.length;
    const isLimitReached = remainingChars === 0;
    const isNearLimit = remainingChars <= 50;

    return {
        // Рефы
        emojiBtnRef,
        fileInputRef,
        textInputRef,

        // Данные постов
        posts,
        loading,
        likedPosts,
        expandedPosts,
        hasMore,
        loadingMore,

        // Новый пост
        newPostText,
        selectedImage,
        remainingChars,
        isLimitReached,
        isNearLimit,

        // UI
        showEmojiPicker,
        setShowEmojiPicker,
        showLogoutModal,
        toast,
        setToast,
        showMenuPostId,
        setShowMenuPostId,
        showEditModal,
        editingPost,

        // Хелперы
        MAX_VISIBLE_LINES,

        // Обработчики
        handlePublish,
        handleLikeToggle,
        handleDeletePost,
        handleEditPost,
        handleEditUpdate,
        handleEditClose,
        handleCopyLink,
        handleFileChange,
        handleRemoveImage,
        handleAttachmentClick,
        handleTextChange,
        handleKeyDown,
        handleEmojiClick,
        togglePostExpand,
        handleLogoutClick,
        handleLogoutCancel,
        handleLogoutConfirm,

        // Утилиты
        navigate,
        getLineCount,
        getTruncatedText,
    };
}