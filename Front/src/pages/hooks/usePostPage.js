import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookie } from '../../utils/cookies';
import { addComment, getPostComments, getCommentAuthor } from '../../services/commentsApi';
import { addLike, removeLike, hasUserLikedPost } from '../../services/likesApi';
import { updatePost, deletePost } from '../../services/postsApi';

const API_BASE = 'http://localhost:8080';

// ─── Утилиты ────────────────────────────────────────────────────────────────

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
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export function formatCommentDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const diffMs = Date.now() - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMinutes < 1) return 'Только что';
    if (diffMinutes < 60) return `${diffMinutes} мин.`;
    if (diffHours < 24) return `${diffHours} ч.`;
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн.`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function formatCount(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

function getCurrentUserId() {
    const userData = getCookie('catsgram_user_data');
    return userData ? JSON.parse(userData).id : null;
}

// ─── API-хелперы ─────────────────────────────────────────────────────────────

async function fetchAuthor(authorId) {
    try {
        const res = await fetch(`${API_BASE}/users/${authorId}`);
        return res.ok ? await res.json() : null;
    } catch { return null; }
}

async function fetchPostLikes(postId) {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/likes`);
        return res.ok ? await res.json() : [];
    } catch { return []; }
}

async function fetchPostImages(postId) {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/images`);
        if (!res.ok) return [];
        const images = await res.json();
        return images.map(img => ({ id: img.id, url: `${API_BASE}/images/${img.id}` }));
    } catch { return []; }
}

// ─── Кастомный хук ───────────────────────────────────────────────────────────

export function usePostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const menuRef = useRef(null);
    const commentInputRef = useRef(null);
    const commentEmojiBtnRef = useRef(null);

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [liked, setLiked] = useState(false);
    const [toast, setToast] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [canGoBack, setCanGoBack] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [sortNewest, setSortNewest] = useState(true);

    // ── Сортировка комментариев ───────────────────────────────────────────────

    const sortComments = (list, newest) => {
        const sorted = [...list].sort((a, b) =>
            newest
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt)
        );
        setComments(sorted);
    };

    const handleSortToggle = () => {
        const newSort = !sortNewest;
        setSortNewest(newSort);
        sortComments(comments, newSort);
    };

    // ── Загрузка данных поста ─────────────────────────────────────────────────

    const loadPostData = async () => {
        setLoading(true);
        try {
            const currentUserId = getCurrentUserId();

            const postRes = await fetch(`${API_BASE}/posts/${postId}`);
            if (!postRes.ok) throw new Error('Пост не найден');
            const postData = await postRes.json();

            const [author, images, likes, isLiked] = await Promise.all([
                fetchAuthor(postData.authorId),
                fetchPostImages(postData.id),
                fetchPostLikes(postData.id),
                currentUserId ? hasUserLikedPost(postData.id, currentUserId) : false,
            ]);

            setIsOwner(currentUserId === postData.authorId);

            const rawComments = await getPostComments(postData.id);
            const commentsWithAuthors = await Promise.all(
                rawComments.map(async (comment) => {
                    const commentAuthor = await getCommentAuthor(comment.authorId);
                    return { ...comment, author: commentAuthor, time: formatCommentDate(comment.createdAt) };
                })
            );
            sortComments(commentsWithAuthors, true);

            setPost({
                id: postData.id,
                authorId: postData.authorId,
                text: postData.description || '',
                createdAt: postData.postDate,
                time: formatPostDate(postData.postDate),
                username: author?.username || `User${postData.authorId}`,
                avatar: author?.avatar || null,
                verified: author?.verified || false,
                likes: likes.length,
                imageUrl: images[0]?.url || null,
                hasImage: images.length > 0,
            });
            setLiked(isLiked);
        } catch (error) {
            console.error('Ошибка загрузки поста:', error);
            setToast({ message: 'Не удалось загрузить пост', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ── Лайки ─────────────────────────────────────────────────────────────────

    const handleLikeToggle = async () => {
        const userId = getCurrentUserId();
        if (!userId) {
            setToast({ message: 'Необходимо войти для лайков', type: 'error' });
            return;
        }
        try {
            if (liked) {
                await removeLike(postId, userId);
                setLiked(false);
                setPost(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
            } else {
                await addLike(postId, userId);
                setLiked(true);
                setPost(prev => ({ ...prev, likes: prev.likes + 1 }));
            }
        } catch {
            setToast({ message: 'Не удалось обновить лайк', type: 'error' });
        }
    };

    // ── Комментарии ───────────────────────────────────────────────────────────

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const userId = getCurrentUserId();
        if (!userId) {
            setToast({ message: 'Необходимо войти для комментариев', type: 'error' });
            return;
        }

        setSubmitting(true);
        try {
            const newComment = await addComment(postId, userId, commentText);
            const author = await fetchAuthor(userId);
            const commentWithAuthor = { ...newComment, author, time: 'Только что' };

            const updated = sortNewest
                ? [commentWithAuthor, ...comments]
                : [...comments, commentWithAuthor];
            setComments(updated);
            setCommentText('');
            setToast({ message: 'Комментарий добавлен!', type: 'success' });
        } catch {
            setToast({ message: 'Не удалось добавить комментарий', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Эмодзи ────────────────────────────────────────────────────────────────

    const handleEmojiClick = (emoji) => {
        const textarea = commentInputRef.current;
        if (textarea) {
            const { selectionStart: start, selectionEnd: end } = textarea;
            const newText = commentText.slice(0, start) + emoji + commentText.slice(end);
            setCommentText(newText);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + emoji.length, start + emoji.length);
            }, 0);
        } else {
            setCommentText(prev => prev + emoji);
        }
        setShowEmojiPicker(false);
    };

    // ── Навигация ─────────────────────────────────────────────────────────────

    const handleBack = () => {
        canGoBack ? navigate(-1) : navigate('/feed');
    };

    // ── Меню поста ────────────────────────────────────────────────────────────

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/post/${postId}`;
        try {
            await navigator.clipboard.writeText(url);
            setToast({ message: 'Ссылка скопирована!', type: 'success' });
        } catch {
            setToast({ message: 'Не удалось скопировать ссылку', type: 'error' });
        }
        setShowMenu(false);
    };

    const handleEditPost = async (updatedData) => {
        try {
            const userId = getCurrentUserId();
            await updatePost(postId, userId, updatedData.text, updatedData.imageFile);
            setPost(prev => ({
                ...prev,
                text: updatedData.text,
                imageUrl: updatedData.imageUrl || prev.imageUrl,
                hasImage: updatedData.hasImage ?? prev.hasImage,
            }));
            setShowEditModal(false);
            setToast({ message: 'Пост обновлён!', type: 'success' });
        } catch {
            setToast({ message: 'Ошибка при обновлении поста', type: 'error' });
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Вы уверены что хотите удалить пост?')) return;
        try {
            await deletePost(postId);
            setToast({ message: 'Пост удалён', type: 'success' });
            setTimeout(() => navigate('/feed'), 1000);
        } catch {
            setToast({ message: 'Ошибка при удалении поста', type: 'error' });
        }
    };

    // ── Эффекты ───────────────────────────────────────────────────────────────

    useEffect(() => {
        setCanGoBack(window.history.length > 1);
        loadPostData();

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
            if (!e.target.closest('.emoji-picker-container')) setShowEmojiPicker(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [postId]);

    return {
        // Рефы
        menuRef,
        commentInputRef,
        commentEmojiBtnRef,

        // Данные
        post,
        comments,
        commentText,
        setCommentText,
        loading,
        submitting,
        liked,
        isOwner,
        sortNewest,

        // UI
        showMenu,
        setShowMenu,
        showEditModal,
        setShowEditModal,
        showEmojiPicker,
        setShowEmojiPicker,
        toast,
        setToast,

        // Обработчики
        handleLikeToggle,
        handleCommentSubmit,
        handleEmojiClick,
        handleBack,
        handleCopyLink,
        handleEditPost,
        handleDeletePost,
        handleSortToggle,

        // Утилиты
        formatCount,
    };
}