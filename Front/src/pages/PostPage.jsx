import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/cookies';
import { addComment, getPostComments, getCommentAuthor } from '../services/commentsApi';
import { addLike, removeLike, hasUserLikedPost } from '../services/likesApi';
import { updatePost, deletePost } from '../services/postsApi';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import EditPostModal from '../components/EditPostModal';
import './PostPage.css';
import EmojiPicker from '../components/EmojiPicker';


function PostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();

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
    const [activeEmojiCategory, setActiveEmojiCategory] = useState(0);
    const [canGoBack, setCanGoBack] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [sortNewest, setSortNewest] = useState(true); // true = новые, false = старые

    const menuRef = useRef(null);
    const commentInputRef = useRef(null);
    const commentEmojiBtnRef = useRef(null);

    useEffect(() => {
        setCanGoBack(window.history.length > 1);
        loadPostData();

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
            if (!e.target.closest('.emoji-picker-container')) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [postId]);

    const loadPostData = async () => {
        setLoading(true);
        try {
            const userData = getCookie('catsgram_user_data');
            const currentUserId = userData ? JSON.parse(userData).id : null;

            const postResponse = await fetch(`http://localhost:8080/posts/${postId}`);
            if (!postResponse.ok) throw new Error('Пост не найден');
            const postData = await postResponse.json();

            const author = await fetchAuthor(postData.authorId);
            const images = await fetchPostImages(postData.id);
            const likes = await fetchPostLikes(postData.id);
            const isLiked = currentUserId ? await hasUserLikedPost(postData.id, currentUserId) : false;

            setIsOwner(currentUserId === postData.authorId);

            const rawComments = await getPostComments(postData.id);
            const commentsWithAuthors = await Promise.all(
                rawComments.map(async (comment) => {
                    const commentAuthor = await getCommentAuthor(comment.authorId);
                    return {
                        ...comment,
                        author: commentAuthor,
                        time: formatCommentDate(comment.createdAt),
                    };
                })
            );

            // Сортировка по умолчанию - новые сверху
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

    const sortComments = (commentsList, newest) => {
        const sorted = [...commentsList].sort((a, b) => {
            if (newest) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
        });
        setComments(sorted);
    };

    const handleSortToggle = () => {
        const newSort = !sortNewest;
        setSortNewest(newSort);
        sortComments(comments, newSort);
    };

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

    const fetchPostImages = async (postId) => {
        try {
            const response = await fetch(`http://localhost:8080/posts/${postId}/images`);
            if (!response.ok) return [];
            const images = await response.json();
            return images.map(img => ({ id: img.id, url: `http://localhost:8080/images/${img.id}` }));
        } catch { return []; }
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
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    };

    const formatCommentDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffMinutes < 1) return 'Только что';
        if (diffMinutes < 60) return `${diffMinutes} мин.`;
        if (diffHours < 24) return `${diffHours} ч.`;
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн.`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    const formatCount = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const handleLikeToggle = async () => {
        const userData = getCookie('catsgram_user_data');
        const currentUserId = userData ? JSON.parse(userData).id : null;
        if (!currentUserId) {
            setToast({ message: 'Необходимо войти для лайков', type: 'error' });
            return;
        }
        try {
            if (liked) {
                await removeLike(postId, currentUserId);
                setLiked(false);
                setPost(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
            } else {
                await addLike(postId, currentUserId);
                setLiked(true);
                setPost(prev => ({ ...prev, likes: prev.likes + 1 }));
            }
        } catch (error) {
            setToast({ message: 'Не удалось обновить лайк', type: 'error' });
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const userData = getCookie('catsgram_user_data');
        const currentUserId = userData ? JSON.parse(userData).id : null;
        if (!currentUserId) {
            setToast({ message: 'Необходимо войти для комментариев', type: 'error' });
            return;
        }

        setSubmitting(true);
        try {
            const newComment = await addComment(postId, currentUserId, commentText);
            const author = await fetchAuthor(currentUserId);
            const commentWithAuthor = {
                ...newComment,
                author,
                time: 'Только что',
            };

            // Добавляем комментарий и сортируем
            const updatedComments = sortNewest
                ? [commentWithAuthor, ...comments]
                : [...comments, commentWithAuthor];

            setComments(updatedComments);
            setCommentText('');
            setToast({ message: 'Комментарий добавлен!', type: 'success' });
        } catch (error) {
            setToast({ message: 'Не удалось добавить комментарий', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEmojiClick = (emoji) => {
        const textarea = commentInputRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText = commentText.substring(0, start) + emoji + commentText.substring(end);
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

    const handleBack = () => {
        if (canGoBack) {
            navigate(-1);
        } else {
            navigate('/feed');
        }
    };

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/post/${postId}`;
        try {
            await navigator.clipboard.writeText(url);
            setToast({ message: 'Ссылка скопирована!', type: 'success' });
        } catch (err) {
            setToast({ message: 'Не удалось скопировать ссылку', type: 'error' });
        }
        setShowMenu(false);
    };

    const handleEditPost = async (updatedData) => {
        try {
            const userData = getCookie('catsgram_user_data');
            const userId = userData ? JSON.parse(userData).id : null;

            await updatePost(postId, userId, updatedData.text, updatedData.imageFile);

            setPost(prev => ({
                ...prev,
                text: updatedData.text,
                imageUrl: updatedData.imageUrl || prev.imageUrl,
                hasImage: updatedData.hasImage !== undefined ? updatedData.hasImage : prev.hasImage,
            }));

            setShowEditModal(false);
            setToast({ message: 'Пост обновлён!', type: 'success' });
        } catch (error) {
            setToast({ message: 'Ошибка при обновлении поста', type: 'error' });
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Вы уверены что хотите удалить пост?')) return;

        try {
            await deletePost(postId);
            setToast({ message: 'Пост удалён', type: 'success' });
            setTimeout(() => navigate('/feed'), 1000);
        } catch (error) {
            setToast({ message: 'Ошибка при удалении поста', type: 'error' });
        }
    };

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
                    <button className="header-back-btn" onClick={handleBack}>
                        ← Назад
                    </button>
                    <h1 className="header-title">Пост</h1>
                    <div className="header-spacer"></div>
                </div>

                {/* Post Card */}
                <div className="post-card-new">
                    <div className="post-header-new">
                        <div className="post-author-new">
                            <div className="post-avatar-new">
                                {post.avatar ? (
                                    <img src={post.avatar} alt="avatar" />
                                ) : (
                                    <span>{post.username?.[0]?.toUpperCase() || '👤'}</span>
                                )}
                            </div>
                            <div className="post-author-info-new">
                                <div className="post-author-row">
                                    <span className="post-username-new">{post.username}</span>
                                    {post.verified && <span className="verified-badge-new">✅</span>}
                                    <span className="post-time-new">{post.time}</span>
                                </div>
                            </div>
                        </div>

                        {/* Three Dots Menu */}
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
                                        {comment.author?.avatar ? (
                                            <img src={comment.author.avatar} alt="avatar" />
                                        ) : (
                                            <span>{comment.author?.username?.[0]?.toUpperCase() || '👤'}</span>
                                        )}
                                    </div>
                                    <div className="comment-content-new">
                                        <div className="comment-header-new">
                                            <span className="comment-author-new">{comment.author?.username || `User${comment.authorId}`}</span>
                                            {comment.author?.verified && <span className="verified-badge-new">✅</span>}
                                            <span className="comment-time-new">{comment.time}</span>
                                        </div>
                                        <div className="comment-text-new">{highlightMentions(comment.text)}</div>
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

                {/* Comment Input - обнови эту секцию */}
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

            {/* Edit Post Modal */}
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

function highlightMentions(text) {
    if (!text) return '';
    return text.split(/(@\w+)/g).map((part, index) => {
        if (part.startsWith('@')) {
            return <span key={index} className="mention-link">{part}</span>;
        }
        return part;
    });
}

export default PostPage;