import React from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import EditPostModal from '../components/EditPostModal';
import EmojiPicker from '../components/EmojiPicker';
import { parseMentions } from '../utils/parseMentions.jsx';
import { usePostPage } from './hooks/usePostPage';
import '../styles/pages/PostPage.css';

function PostPage() {
    const {
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
    } = usePostPage();

    if (loading) {
        return (
            <Layout>
                <div className="post-page-loading">
                    <div className="spinner"></div>
                    <p>Загрузка поста...</p>
                </div>
            </Layout>
        );
    }

    if (!post) {
        return (
            <Layout>
                <div className="post-not-found">
                    <h2>😿 Пост не найден</h2>
                    <button className="back-button" onClick={handleBack}>← Назад</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="post-page-new">
                {/* Header */}
                <div className="post-page-header">
                    <button className="header-back-btn" onClick={handleBack}>← Назад</button>
                    <h1 className="header-title">Пост</h1>
                    <div className="header-spacer"></div>
                </div>

                {/* Post Card */}
                <div className="post-card-new">
                    <div className="post-header-new">
                        <div className="post-author-new">
                            <div className="post-avatar-new">
                                {post.avatar
                                    ? <img src={post.avatar} alt="avatar" />
                                    : <span>{post.username?.[0]?.toUpperCase() || '👤'}</span>
                                }
                            </div>
                            <div className="post-author-info-new">
                                <div className="post-author-row">
                                    <span className="post-username-new">{post.username}</span>
                                    {post.verified && <span className="verified-badge-new">✅</span>}
                                    <span className="post-time-new">{post.time}</span>
                                </div>
                            </div>
                        </div>

                        {/* Меню */}
                        <div className="menu-container" ref={menuRef}>
                            <button className="menu-dots-btn" onClick={() => setShowMenu(!showMenu)}>
                                ⋯
                            </button>
                            {showMenu && (
                                <div className="menu-dropdown">
                                    <button className="menu-item" onClick={handleCopyLink}>
                                        🔗 Копировать ссылку
                                    </button>
                                    {isOwner && (
                                        <>
                                            <button className="menu-item" onClick={() => {
                                                setShowEditModal(true);
                                                setShowMenu(false);
                                            }}>
                                                ✏️ Редактировать
                                            </button>
                                            <button className="menu-item danger" onClick={handleDeletePost}>
                                                🗑️ Удалить пост
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="post-text-new">{post.text}</div>

                    {post.imageUrl && (
                        <div className="post-image-container-new">
                            <img src={post.imageUrl} alt="post" className="post-image-new" />
                        </div>
                    )}

                    <div className="post-stats-new">
                        <div className="stats-left">
                            <button
                                className={`stat-btn-new like-btn-new ${liked ? 'liked' : ''}`}
                                onClick={handleLikeToggle}
                            >
                                ❤️ <span>{formatCount(post.likes)}</span>
                            </button>
                            <span className="stat-btn-new">
                                💬 <span>{formatCount(comments.length)}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="comments-section-new">
                    <div className="comments-header" onClick={handleSortToggle}>
                        <span>{sortNewest ? 'Новые' : 'Старые'}</span>
                        <span className="dropdown-arrow">▼</span>
                    </div>

                    <div className="comments-list-new">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="comment-item-new">
                                    <div className="comment-avatar-new">
                                        {comment.author?.avatar
                                            ? <img src={comment.author.avatar} alt="avatar" />
                                            : <span>{comment.author?.username?.[0]?.toUpperCase() || '👤'}</span>
                                        }
                                    </div>
                                    <div className="comment-content-new">
                                        <div className="comment-header-new">
                                            <span className="comment-author-new">
                                                {comment.author?.username || `User${comment.authorId}`}
                                            </span>
                                            {comment.author?.verified && <span className="verified-badge-new">✅</span>}
                                            <span className="comment-time-new">{comment.time}</span>
                                        </div>
                                        <div className="comment-text-new">{parseMentions(comment.text)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-comments-new">
                                <p>💬 Будьте первым, кто прокомментирует!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comment Input */}
                <div className="comment-input-container-new">
                    <div className="input-wrapper-comment">
                        <input
                            ref={commentInputRef}
                            type="text"
                            className="comment-input-new"
                            placeholder="Напишите комментарий..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleCommentSubmit(e);
                                }
                            }}
                            disabled={submitting}
                        />
                        <button
                            ref={commentEmojiBtnRef}
                            className="emoji-btn-new"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowEmojiPicker(!showEmojiPicker);
                            }}
                            type="button"
                        >
                            😊
                        </button>
                        {showEmojiPicker && (
                            <EmojiPicker
                                onEmojiSelect={handleEmojiClick}
                                anchorRef={commentEmojiBtnRef}
                                onClose={() => setShowEmojiPicker(false)}
                            />
                        )}
                    </div>
                    <button
                        className="send-btn-new"
                        onClick={handleCommentSubmit}
                        disabled={!commentText.trim() || submitting}
                        type="button"
                    >
                        ↑
                    </button>
                </div>
            </div>

            {showEditModal && (
                <EditPostModal
                    post={post}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleEditPost}
                />
            )}

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </Layout>
    );
}

export default PostPage;