import React from 'react';
import { Link } from 'react-router-dom';
import LogoutModal from '../components/LogoutModal';
import Toast from '../components/Toast';
import EmojiPicker from '../components/EmojiPicker';
import EditPostModal from '../components/EditPostModal';
import { parseMentions } from '../utils/parseMentions.jsx';
import { getCookie } from '../utils/cookies';
import { useFeed, formatCount, getLineCount, getTruncatedText } from './hooks/useFeed';
import '../styles/pages/Feed.css';
import logo from '../assets/logo.png';

function Feed({ logout }) {
    const {
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
    } = useFeed(logout);

    const currentUsername = JSON.parse(getCookie('catsgram_user_data'))?.username || 'user';

    return (
        <div className="feed-page">
            <div className="feed-container">
                <aside className="sidebar">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Catsgram Logo" className="logo-image" />
                    </div>

                    <nav className="sidebar-nav">
                        <Link to="/feed" className="nav-item active">
                            <span className="nav-icon">📰</span>
                            <span>Лента</span>
                        </Link>
                        <Link to={`/u/${currentUsername}`} className="nav-item">
                            <span className="nav-icon">👤</span>
                            <span>Профиль</span>
                        </Link>
                        <Link to="/settings" className="nav-item">
                            <span className="nav-icon">⚙️</span>
                            <span>Настройки</span>
                        </Link>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="logout-menu-btn" onClick={handleLogoutClick}>
                            <span className="nav-icon">🚪</span>
                            <span>Выйти</span>
                        </button>
                    </div>
                </aside>

                <main className="feed-main">
                    {/* ── Форма нового поста ── */}
                    <div className="create-post">
                        <div className="create-post-header">
                            <div className="user-avatar">U</div>
                            <textarea
                                ref={textInputRef}
                                placeholder="Что нового?"
                                value={newPostText}
                                onChange={handleTextChange}
                                onKeyDown={handleKeyDown}
                                className="create-post-input"
                                rows={1}
                            />
                        </div>

                        <div className={`character-counter ${isNearLimit ? 'warning' : ''} ${isLimitReached ? 'error' : ''}`}>
                            {remainingChars} символов осталось
                        </div>

                        {selectedImage && (
                            <div className="image-preview">
                                <img src={selectedImage.preview} alt="preview" />
                                <button className="remove-image-btn" onClick={handleRemoveImage}>✕</button>
                                <span className="image-name">{selectedImage.name}</span>
                            </div>
                        )}

                        <div className="create-post-actions">
                            <div className="create-post-left">
                                <button className="action-btn" title="Прикрепить фото" onClick={handleAttachmentClick}>
                                    📎
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.gif,.webp,.avif,.heic,.heif"
                                    multiple={false}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />

                                <button
                                    ref={emojiBtnRef}
                                    className="action-btn"
                                    title="Добавить смайлик"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowEmojiPicker(!showEmojiPicker);
                                    }}
                                    disabled={isLimitReached}
                                    type="button"
                                >
                                    😊
                                </button>

                                {showEmojiPicker && (
                                    <EmojiPicker
                                        onEmojiSelect={handleEmojiClick}
                                        anchorRef={emojiBtnRef}
                                        onClose={() => setShowEmojiPicker(false)}
                                    />
                                )}
                            </div>

                            <div className="publish-group">
                                <span className="shortcut-hint">Shift + Enter</span>
                                <button
                                    className="publish-btn"
                                    onClick={handlePublish}
                                    disabled={(!newPostText.trim() && !selectedImage) || isLimitReached}
                                >
                                    Опубликовать
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Лента постов ── */}
                    <div className="posts-feed">
                        {posts.length === 0 && !loading ? (
                            <div className="no-posts">
                                <p>😿 Постов пока нет</p>
                                <p className="no-posts-hint">Будь первым — опубликуй что-нибудь!</p>
                            </div>
                        ) : (
                            posts.map((post) => {
                                const isExpanded = expandedPosts[post.id] || false;
                                const needsTruncate = getLineCount(post.text) > MAX_VISIBLE_LINES;
                                const displayText = needsTruncate && !isExpanded
                                    ? getTruncatedText(post.text, MAX_VISIBLE_LINES)
                                    : post.text;

                                return (
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
                                                        {post.username === currentUsername && (
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

                                        {/* Модалка редактирования */}
                                        {showEditModal && editingPost?.id === post.id && (
                                            <EditPostModal
                                                post={editingPost}
                                                onClose={handleEditClose}
                                                onUpdate={handleEditUpdate}
                                            />
                                        )}

                                        {/* Текст поста */}
                                        {displayText && (
                                            <div className="post-text">
                                                {parseMentions(displayText)}
                                            </div>
                                        )}

                                        {needsTruncate && (
                                            <button className="read-more-btn" onClick={() => togglePostExpand(post.id)}>
                                                {isExpanded ? 'Свернуть ↑' : 'Читать дальше ↓'}
                                            </button>
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
                                                    onClick={() => handleLikeToggle(post.id)}
                                                >
                                                    <span className="like-icon">{likedPosts[post.id] ? '❤️' : '🤍'}</span>
                                                    <span>{formatCount(post.likes || 0)}</span>
                                                </button>
                                                <button
                                                    className="stat-btn comment-btn"
                                                    onClick={() => navigate(`/post/${post.id}`)}
                                                >
                                                    💬 <span>{formatCount(post.comments || 0)}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        )}

                        {loadingMore && (
                            <div className="loading-more">
                                <div className="spinner"></div>
                                <p>Загрузка...</p>
                            </div>
                        )}

                        {!hasMore && posts.length > 0 && !loading && (
                            <div className="no-more-posts">
                                <p>🎉 Все посты загружены!</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showLogoutModal && (
                <LogoutModal
                    onConfirm={handleLogoutConfirm}
                    onCancel={handleLogoutCancel}
                />
            )}

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}

export default Feed;