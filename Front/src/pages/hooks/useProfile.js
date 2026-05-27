import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookie } from '../../utils/cookies';
import { addLike, removeLike, hasUserLikedPost } from '../../services/likesApi';

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
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function formatCount(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

export function sortPosts(postsList, order) {
    const sorted = [...postsList];
    switch (order) {
        case 'oldest':
            return sorted.sort((a, b) =>
                new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
            );
        case 'likes':
            return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        case 'newest':
        default:
            return sorted.sort((a, b) =>
                new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
    }
}

function getCurrentUser() {
    const userData = getCookie('catsgram_user_data');
    return userData ? JSON.parse(userData) : null;
}

function buildEmptyProfile(username) {
    return {
        username,
        displayName: username,
        bio: 'Description',
        avatar: null,
        cover: null,
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString(),
    };
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

async function fetchPostComments(postId) {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
        return res.ok ? await res.json() : [];
    } catch { return []; }
}

async function fetchPostImages(postId) {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/images`);
        if (!res.ok) return [];
        const images = await res.json();
        return images.map(img => ({
            id: img.id,
            url: `${API_BASE}/images/${img.id}`,
            fileName: img.originalFileName,
        }));
    } catch { return []; }
}

async function enrichPosts(rawPosts, currentOrder) {
    const postsWithDetails = await Promise.all(
        rawPosts.map(async (post) => {
            const [author, likes, comments, images] = await Promise.all([
                fetchAuthor(post.authorId),
                fetchPostLikes(post.id),
                fetchPostComments(post.id),
                fetchPostImages(post.id),
            ]);
            return {
                id: post.id,
                authorId: post.authorId,
                text: post.description || '',
                createdAt: post.postDate,
                time: formatPostDate(post.postDate),
                username: author?.username || `User${post.authorId}`,
                avatar: author?.avatar || null,
                verified: author?.verified || false,
                likes: likes?.length || 0,
                comments: comments?.length || 0,
                imageUrl: images?.[0]?.url || null,
                hasImages: images?.length > 0,
            };
        })
    );
    return sortPosts(postsWithDetails, currentOrder);
}

// ─── Кастомный хук ───────────────────────────────────────────────────────────

export function useProfile() {
    const { username } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [likedPosts, setLikedPosts] = useState({});
    const [showMenuPostId, setShowMenuPostId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [toast, setToast] = useState(null);
    const [sortOrder, setSortOrder] = useState('newest');

    // ── Загрузка лайков ───────────────────────────────────────────────────────

    async function loadLikedStatuses(postList, currentUserId) {
        if (!currentUserId) return;
        const statuses = {};
        await Promise.all(
            postList.map(async (post) => {
                try {
                    statuses[post.id] = await hasUserLikedPost(post.id, currentUserId);
                } catch {
                    statuses[post.id] = false;
                }
            })
        );
        setLikedPosts(statuses);
    }

    // ── Загрузка постов пользователя ─────────────────────────────────────────

    async function loadUserPosts(userId, currentUserId, currentOrder) {
        try {
            const res = await fetch(`${API_BASE}/users/${userId}/posts`);
            if (!res.ok) { setPosts([]); return; }

            const rawPosts = await res.json();
            const enriched = await enrichPosts(rawPosts, currentOrder);
            setPosts(enriched);
            await loadLikedStatuses(enriched, currentUserId);
        } catch (err) {
            console.error('Ошибка загрузки постов профиля:', err);
            setPosts([]);
        }
    }

    // ── Загрузка профиля ──────────────────────────────────────────────────────

    const loadProfile = async () => {
        setLoading(true);
        try {
            const currentUser = getCurrentUser();
            const currentUserId = currentUser?.id;

            if (currentUser?.username === username) {
                setIsOwnProfile(true);
                setProfile({
                    username: currentUser.username || username,
                    displayName: currentUser.username || username,
                    bio: 'Description',
                    avatar: null,
                    cover: null,
                    followersCount: 0,
                    followingCount: 0,
                    createdAt: new Date().toISOString(),
                });
                await loadUserPosts(currentUser.id, currentUserId, sortOrder);
            } else {
                setIsOwnProfile(false);
                try {
                    const res = await fetch(`${API_BASE}/users`);
                    if (res.ok) {
                        const users = await res.json();
                        const foundUser = users.find(u => u.username === username);
                        if (foundUser) {
                            setProfile({
                                username: foundUser.username,
                                displayName: foundUser.displayName || foundUser.username,
                                bio: foundUser.bio || 'Description',
                                avatar: foundUser.avatar || null,
                                cover: foundUser.cover || null,
                                followersCount: foundUser.followersCount || 0,
                                followingCount: foundUser.followingCount || 0,
                                createdAt: foundUser.createdAt || new Date().toISOString(),
                            });
                            await loadUserPosts(foundUser.id, currentUserId, sortOrder);
                        } else {
                            setProfile(buildEmptyProfile(username));
                            setPosts([]);
                        }
                    } else {
                        setProfile(buildEmptyProfile(username));
                        setPosts([]);
                    }
                } catch {
                    setProfile(buildEmptyProfile(username));
                    setPosts([]);
                }
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setProfile(buildEmptyProfile(username));
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // ── Сортировка ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (posts.length > 0) {
            setPosts(prev => sortPosts(prev, sortOrder));
        }
    }, [sortOrder]);

    // ── Меню поста ────────────────────────────────────────────────────────────

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

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Вы уверены что хотите удалить пост?')) return;
        try {
            const res = await fetch(`${API_BASE}/posts/${postId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            setPosts(prev => prev.filter(p => p.id !== postId));
            setToast({ message: 'Пост удалён', type: 'success' });
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

    const handleEditUpdate = (updatedData) => {
        setPosts(prev => prev.map(p =>
            p.id === editingPost.id ? { ...p, ...updatedData } : p
        ));
        setShowEditModal(false);
        setEditingPost(null);
        setToast({ message: 'Пост обновлён!', type: 'success' });
    };

    const handleEditClose = () => {
        setShowEditModal(false);
        setEditingPost(null);
    };

    // ── Лайки ─────────────────────────────────────────────────────────────────

    const handleLikeToggle = async (postId) => {
        const userId = getCurrentUser()?.id;
        if (!userId) return;

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
        }
    };

    // ── Эффекты ───────────────────────────────────────────────────────────────

    useEffect(() => { loadProfile(); }, [username]);

    return {
        // Данные
        profile,
        posts,
        loading,
        isOwnProfile,
        likedPosts,
        sortOrder,
        setSortOrder,

        // UI
        showMenuPostId,
        setShowMenuPostId,
        showEditModal,
        editingPost,
        toast,
        setToast,

        // Обработчики
        handleCopyLink,
        handleDeletePost,
        handleEditPost,
        handleEditUpdate,
        handleEditClose,
        handleLikeToggle,

        // Утилиты
        navigate,
        formatCount,
    };
}