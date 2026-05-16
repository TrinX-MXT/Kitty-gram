import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCookie } from '../utils/cookies';
import { fetchPosts } from '../services/postsApi';
import { getPostLikes, addLike, removeLike, hasUserLikedPost } from '../services/likesApi';
import avatarPlaceholder from '../assets/avatar-placeholder.png';
import Button from '../components/Button';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import EditPostModal from '../components/EditPostModal';
import '../styles/pages/Profile.css';
import {parseMentions} from "../utils/parseMentions.jsx";

function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [likedPosts, setLikedPosts] = useState({});
    const [showMenuPostId, setShowMenuPostId] = useState(null); // ← Для меню
    const [showEditModal, setShowEditModal] = useState(false); // ← Для редактирования
    const [editingPost, setEditingPost] = useState(null); // ← Для редактирования
    const [toast, setToast] = useState(null); // ← Для уведомлений
    const [sortOrder, setSortOrder] = useState('newest'); // ← Для сортировки

    useEffect(() => {
        loadProfile();
    }, [username]);

    const loadProfile = async () => {
        setLoading(true);

        try {
            const userData = getCookie('catsgram_user_data');
            const currentUser = userData ? JSON.parse(userData) : null;
            const currentUserId = currentUser?.id;

            // Проверяем свой ли это профиль
            if (currentUser && currentUser.username === username) {
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

                // Загружаем посты текущего пользователя
                await loadUserPosts(currentUser.id, currentUserId);

            } else {
                // Чужой профиль
                setIsOwnProfile(false);

                try {
                    const usersResponse = await fetch('http://localhost:8080/users');

                    if (usersResponse.ok) {
                        const users = await usersResponse.json();
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

                            // Загружаем посты найденного пользователя
                            await loadUserPosts(foundUser.id, currentUserId);
                        } else {
                            setProfile({
                                username: username,
                                displayName: username,
                                bio: 'Description',
                                avatar: null,
                                cover: null,
                                followersCount: 0,
                                followingCount: 0,
                                createdAt: new Date().toISOString(),
                            });
                            setPosts([]);
                        }
                    } else {
                        setProfile({
                            username: username,
                            displayName: username,
                            bio: 'Description',
                            avatar: null,
                            cover: null,
                            followersCount: 0,
                            followingCount: 0,
                            createdAt: new Date().toISOString(),
                        });
                        setPosts([]);
                    }

                } catch (err) {
                    setProfile({
                        username: username,
                        displayName: username,
                        bio: 'Description',
                        avatar: null,
                        cover: null,
                        followersCount: 0,
                        followingCount: 0,
                        createdAt: new Date().toISOString(),
                    });
                    setPosts([]);
                }
            }

        } catch (error) {
            console.error('Ошибка:', error);
            setProfile({
                username: username,
                displayName: username,
                bio: 'Description',
                avatar: null,
                cover: null,
                followersCount: 0,
                followingCount: 0,
                createdAt: new Date().toISOString(),
            });
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async (postId) => {
        const url = `${window.location.origin}/post/${postId}`;
        try {
            await navigator.clipboard.writeText(url);
            setToast({ message: 'Ссылка скопирована!', type: 'success' });
        } catch (err) {
            setToast({ message: 'Не удалось скопировать ссылку', type: 'error' });
        }
        setShowMenuPostId(null);
    };

    // Пересортировка при изменении sortOrder
    useEffect(() => {
        if (posts.length > 0) {
            setPosts(prev => sortPosts(prev, sortOrder));
        }
    }, [sortOrder]);

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Вы уверены что хотите удалить пост?')) return;

        try {
            const response = await fetch(`http://localhost:8080/posts/${postId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Не удалось удалить пост');

            setPosts(prev => prev.filter(p => p.id !== postId));
            setToast({ message: 'Пост удалён', type: 'success' });
        } catch (error) {
            setToast({ message: 'Ошибка при удалении поста', type: 'error' });
        }
        setShowMenuPostId(null);
    };

    const handleEditPost = (post) => {
        setShowEditModal(true);
        setEditingPost(post);
        setShowMenuPostId(null);
    };



    // Загрузка постов пользователя с полной информацией
    const loadUserPosts = async (userId, currentUserId) => {
        try {
            const response = await fetch(`http://localhost:8080/users/${userId}/posts`);

            if (!response.ok) {
                setPosts([]);
                return;
            }

            const rawPosts = await response.json();

            // Загружаем полную информацию для каждого поста
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

            // СОРТИРУЕМ перед установкой
            const sorted = sortPosts(postsWithDetails, sortOrder);
            setPosts(sorted);

            // Загружаем статус лайков для текущего пользователя
            if (currentUserId) {
                const likedStatuses = {};

                await Promise.all(
                    postsWithDetails.map(async (post) => {
                        try {
                            const isLiked = await hasUserLikedPost(post.id, currentUserId);
                            likedStatuses[post.id] = isLiked;
                        } catch (err) {
                            likedStatuses[post.id] = false;
                        }
                    })
                );

                setLikedPosts(likedStatuses);
            }

        } catch (err) {
            console.error('Ошибка загрузки постов профиля:', err);
            setPosts([]);
        }
    };

    // Вспомогательные функции (можно вынести в postsApi.js)
    const fetchAuthor = async (authorId) => {
        try {
            const response = await fetch(`http://localhost:8080/users/${authorId}`);
            if (!response.ok) return null;
            return await response.json();
        } catch { return null; }
    };

    const fetchPostLikes = async (postId) => {
        try {
            const response = await fetch(`http://localhost:8080/posts/${postId}/likes`);
            if (!response.ok) return [];
            return await response.json();
        } catch { return []; }
    };

    const fetchPostComments = async (postId) => {
        try {
            const response = await fetch(`http://localhost:8080/posts/${postId}/comments`);
            if (!response.ok) return [];
            return await response.json();
        } catch { return []; }
    };

    const fetchPostImages = async (postId) => {
        try {
            const response = await fetch(`http://localhost:8080/posts/${postId}/images`);
            if (!response.ok) return [];
            const images = await response.json();
            return images.map(img => ({
                id: img.id,
                url: `http://localhost:8080/images/${img.id}`,
                fileName: img.originalFileName,
            }));
        } catch { return []; }
    };

    // Сортировка постов
    const sortPosts = (postsList, order) => {
        const sorted = [...postsList];

        switch (order) {
            case 'oldest':
                // Старые сверху (по дате возрастание)
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.postDate || 0);
                    const dateB = new Date(b.createdAt || b.postDate || 0);
                    return dateA - dateB;
                });

            case 'likes':
                // По лайкам (убывание)
                return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));

            case 'newest':
            default:
                // Новые сверху (по дате убывание) - дефолт
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.postDate || 0);
                    const dateB = new Date(b.createdAt || b.postDate || 0);
                    return dateB - dateA;
                });
        }
    };

    const formatPostDate = (isoString) => {
        if (!isoString) return '3 дн.';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Только что';
        if (diffHours < 24) return `${diffHours} ч.`;
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн.`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    // Обработка лайка
    const handleLikeToggle = async (postId, currentLikes) => {
        const userData = getCookie('catsgram_user_data');
        const currentUserId = userData ? JSON.parse(userData).id : null;

        if (!currentUserId) return;

        const isCurrentlyLiked = likedPosts[postId] || false;

        try {
            if (isCurrentlyLiked) {
                await removeLike(postId, currentUserId);
                setLikedPosts(prev => ({ ...prev, [postId]: false }));
                setPosts(prev => prev.map(post =>
                    post.id === postId ? { ...post, likes: Math.max(0, (post.likes || 0) - 1) } : post
                ));
            } else {
                await addLike(postId, currentUserId);
                setLikedPosts(prev => ({ ...prev, [postId]: true }));
                setPosts(prev => prev.map(post =>
                    post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
                ));
            }
        } catch (error) {
            console.error('Ошибка при переключении лайка:', error);
        }
    };

    // Утилиты для отображения
    const getLineCount = (text) => text ? text.split('\n').length : 0;
    const getTruncatedText = (text, maxLines) => {
        if (!text) return '';
        const lines = text.split('\n');
        return lines.length <= maxLines ? text : lines.slice(0, maxLines).join('\n');
    };
    const formatCount = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    if (loading) {
        return (
            <Layout>
                <div className="profile-loading">
                    <div className="spinner"></div>
                    <p>Загрузка профиля...</p>
                </div>
            </Layout>
        );
    }

    if (!profile) return null;

    return (
        <Layout>
            <div className="profile-page">
                {/* Обложка */}
                <div
                    className="profile-cover"
                    style={{
                        backgroundImage: profile.cover ? `url(${profile.cover})` : 'linear-gradient(135deg, #6366f1, #a855f7)'
                    }}
                />

                <div className="profile-container">
                    {/* Аватарка */}
                    <div className="profile-avatar-wrapper">
                        <img
                            src={profile.avatar || avatarPlaceholder}
                            alt={profile.username}
                            className="profile-avatar"
                        />
                    </div>

                    {/* Информация */}
                    <div className="profile-info">
                        <div className="profile-header">
                            <div>
                                <h1 className="profile-display-name">
                                    {profile.displayName}
                                    {isOwnProfile && <span className="own-badge"> (Вы)</span>}
                                </h1>
                                <p className="profile-username">@{profile.username}</p>
                            </div>

                            {!isOwnProfile && (
                                <Button variant="primary">Подписаться</Button>
                            )}
                        </div>

                        <p className="profile-bio">{profile.bio}</p>

                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-value">{profile.followersCount}</span>
                                <span className="stat-label">подписчиков</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{profile.followingCount}</span>
                                <span className="stat-label">подписок</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{posts.length}</span>
                                <span className="stat-label">постов</span>
                            </div>
                        </div>

                        <p className="profile-joined">
                            📅 Регистрация: {new Date(profile.createdAt).toLocaleDateString('ru-RU', {
                            month: 'long',
                            year: 'numeric'
                        })}
                        </p>
                    </div>

                    {/* Посты - в том же стиле что и в Feed */}
                    <div className="profile-posts">
                        <div className="profile-posts-header">
                            <h2 className="section-title">Посты ({posts.length})</h2>

                            <div className="sort-controls">
                                <button
                                    className={`sort-btn ${sortOrder === 'newest' ? 'active' : ''}`}
                                    onClick={() => setSortOrder('newest')}
                                    title="Сначала новые"
                                >
                                    ⬇️ Новее
                                </button>
                                <button
                                    className={`sort-btn ${sortOrder === 'oldest' ? 'active' : ''}`}
                                    onClick={() => setSortOrder('oldest')}
                                    title="Сначала старые"
                                >
                                    ⬆️ Старее
                                </button>
                                <button
                                    className={`sort-btn ${sortOrder === 'likes' ? 'active' : ''}`}
                                    onClick={() => setSortOrder('likes')}
                                    title="По популярности"
                                >
                                    🔥 По популярности
                                </button>
                            </div>
                        </div>

                        {posts.length > 0 ? (
                            <div className="posts-list">
                                {posts.map((post) => {
                                    const displayText = post.text;
                                    const MAX_VISIBLE_LINES = 10;
                                    const lineCount = getLineCount(post.text);
                                    const needsTruncate = lineCount > MAX_VISIBLE_LINES;

                                    return (
                                        <article key={post.id} className="post-card">
                                            {/* Заголовок поста */}
                                            <div className="post-header">
                                                <div className="post-author">
                                                    <div className="post-avatar">
                                                        {post.avatar ? (
                                                            <img src={post.avatar} alt="avatar" />
                                                        ) : (
                                                            <span>{post.username?.[0]?.toUpperCase() || '👤'}</span>
                                                        )}
                                                    </div>
                                                    <div className="post-author-info">
                            <span className="post-username">
                              {post.username || `User${post.authorId}`}
                                {post.verified && <span className="verified-badge">✅</span>}
                            </span>
                                                        <span className="post-time">{post.time || '3 дн.'}</span>
                                                    </div>
                                                </div>
                                                <div className="menu-container">
                                                    <button
                                                        className="post-menu-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowMenuPostId(showMenuPostId === post.id ? null : post.id);
                                                        }}
                                                    >
                                                        ⋯
                                                    </button>

                                                    {showMenuPostId === post.id && (
                                                        <div className="menu-dropdown">
                                                            <button className="menu-item" onClick={() => handleCopyLink(post.id)}>
                                                                🔗 Копировать ссылку
                                                            </button>
                                                            {isOwnProfile && (
                                                                <>
                                                                    <button className="menu-item" onClick={() => handleEditPost(post)}>
                                                                        ✏️ Редактировать
                                                                    </button>
                                                                    <button className="menu-item danger" onClick={() => handleDeletePost(post.id)}>
                                                                        🗑️ Удалить пост
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>


                                            {displayText && (
                                                <div className="post-text">
                                                    {parseMentions(displayText)}
                                                </div>
                                            )}

                                            {/* Изображение поста */}
                                            {post.imageUrl && (
                                                <div className="post-image-container">
                                                    <img
                                                        src={post.imageUrl}
                                                        alt="post"
                                                        className="post-image"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            )}

                                            {/* Статистика */}
                                            <div className="post-stats">
                                                <div className="post-stats-left">
                                                    <button
                                                        className={`stat-btn like-btn ${likedPosts[post.id] ? 'liked' : ''}`}
                                                        onClick={() => handleLikeToggle(post.id, post.likes)}
                                                    >
                                                        <span className="like-icon">{likedPosts[post.id] ? '❤️' : '🤍'}</span>
                                                        <span>{formatCount(post.likes || 0)}</span>
                                                    </button>
                                                    <button
                                                        className="stat-btn comment-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/post/${post.id}`);
                                                        }}
                                                    >
                                                        💬 <span>{formatCount(post.comments || 0)}</span>
                                                    </button>
                                                </div>


                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="no-posts">
                                <p>😿 Нет постов</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Post Modal */}
                {showEditModal && editingPost && (
                    <EditPostModal
                        post={editingPost}
                        onClose={() => {
                            setShowEditModal(false);
                            setEditingPost(null);
                        }}
                        onUpdate={(updatedData) => {
                            setPosts(prev => prev.map(p =>
                                p.id === editingPost.id ? { ...p, ...updatedData } : p
                            ));
                            setShowEditModal(false);
                            setEditingPost(null);
                            setToast({ message: 'Пост обновлён!', type: 'success' });
                        }}
                    />
                )}

                {/* Toast уведомления */}
                {toast && (
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                )}
            </div>
        </Layout>
    );
}

export default Profile;