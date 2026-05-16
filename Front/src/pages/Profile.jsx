import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import EditPostModal from '../components/EditPostModal';
import Button from '../components/Button';
import { parseMentions } from '../utils/parseMentions.jsx';
import avatarPlaceholder from '../assets/avatar-placeholder.png';
import { useProfile } from './hooks/useProfile';
import '../styles/pages/Profile.css';

const MAX_VISIBLE_LINES = 10;

function Profile() {
    const {
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
    } = useProfile();

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
                        backgroundImage: profile.cover
                            ? `url(${profile.cover})`
                            : 'linear-gradient(135deg, #6366f1, #a855f7)'
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
                            year: 'numeric',
                        })}
                        </p>
                    </div>

                    {/* Посты */}
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
                                {posts.map((post) => (
                                    <article key={post.id} className="post-card">
                                        {/* Шапка поста */}
                                        <div className="post-header">
                                            <div className="post-author">
                                                <div className="post-avatar">
                                                    {post.avatar
                                                        ? <img src={post.avatar} alt="avatar" />
                                                        : <span>{post.username?.[0]?.toUpperCase() || '👤'}</span>
                                                    }
                                                </div>
                                                <div className="post-author-info">
                                                    <span className="post-username">
                                                        {post.username || `User${post.authorId}`}
                                                        {post.verified && <span className="verified-badge">✅</span>}
                                                    </span>
                                                    <span className="post-time">{post.time || '3 дн.'}</span>
                                                </div>
                                            </div>

                                            {/* Меню поста */}
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

                                        {/* Текст поста */}
                                        {post.text && (
                                            <div className="post-text">
                                                {parseMentions(post.text)}
                                            </div>
                                        )}

                                        {/* Изображение */}
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
                                                    onClick={() => handleLikeToggle(post.id)}
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
                                ))}
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
                        onClose={handleEditClose}
                        onUpdate={handleEditUpdate}
                    />
                )}

                {toast && (
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                )}
            </div>
        </Layout>
    );
}

export default Profile;