import React, { useEffect, useState, useRef } from 'react';
import { fetchPosts } from '../services/postsApi';
import { getPosts as getMockPosts } from '../services/api';
import emojisData from '../assets/emojis.json';
import LogoutModal from '../components/LogoutModal';
import Toast from '../components/Toast';
import './Feed.css';
import Loader from '../components/Loader';
import logo from '../assets/logo.png';

const MAX_CHARACTERS = 2048;
const MAX_VISIBLE_LINES = 10;

function Feed({ logout }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostText, setNewPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);
    const [expandedPosts, setExpandedPosts] = useState({});
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [toast, setToast] = useState(null); // ← Уведомления

    const fileInputRef = useRef(null);
    const textInputRef = useRef(null);

    // Загрузка постов при монтировании
    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        try {
            // Пробуем загрузить с реального API
            let posts = await fetchPosts();

            // Если пустая строка или ошибка - используем мок данные
            if (!posts || posts.length === 0) {
                console.log('API вернуло пустые данные, используем мок');
                posts = await getMockPosts();

                setToast({
                    message: 'Сервер вернул пустые данные. Показаны тестовые посты.',
                    type: 'error'
                });
            }

            setPosts(posts);
        } catch (error) {
            console.error('Ошибка загрузки постов:', error);

            // Fallback на мок данные
            try {
                const mockPosts = await getMockPosts();
                setPosts(mockPosts);

                setToast({
                    message: 'Не удалось подключиться к серверу. Показаны тестовые посты.',
                    type: 'error'
                });
            } catch (mockError) {
                setToast({
                    message: 'Критическая ошибка загрузки постов',
                    type: 'error'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Авто-ресайз textarea
    useEffect(() => {
        if (textInputRef.current) {
            textInputRef.current.style.height = 'auto';
            textInputRef.current.style.height = Math.min(
                textInputRef.current.scrollHeight,
                150
            ) + 'px';
        }
    }, [newPostText]);

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage({
                file,
                preview: imageUrl,
                name: file.name,
            });
        }
    };

    const handleRemoveImage = () => {
        if (selectedImage?.preview) {
            URL.revokeObjectURL(selectedImage.preview);
        }
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleEmojiClick = (emoji) => {
        const textarea = textInputRef.current;
        const remainingChars = MAX_CHARACTERS - newPostText.length;

        if (remainingChars < emoji.length) {
            return;
        }

        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText =
                newPostText.substring(0, start) +
                emoji +
                newPostText.substring(end);

            if (newText.length <= MAX_CHARACTERS) {
                setNewPostText(newText);

                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + emoji.length, start + emoji.length);
                }, 0);
            }
        } else {
            if ((newPostText + emoji).length <= MAX_CHARACTERS) {
                setNewPostText(newPostText + emoji);
            }
        }
        setShowEmojiPicker(false);
    };

    const handleTextChange = (e) => {
        const text = e.target.value;
        if (text.length <= MAX_CHARACTERS) {
            setNewPostText(text);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            if (newPostText.trim() || selectedImage) {
                handlePublish();
            }
        }
    };

    const handlePublish = () => {
        if (newPostText.trim() || selectedImage) {
            const newPost = {
                id: Date.now(),
                username: 'user',
                avatar: null,
                text: newPostText,
                imageUrl: selectedImage?.preview || null,
                likes: 0,
                comments: 0,
                views: 0,
                time: 'Только что',
            };
            setPosts([newPost, ...posts]);
            setNewPostText('');
            handleRemoveImage();
        }
    };

    const togglePostExpand = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const getLineCount = (text) => {
        if (!text) return 0;
        return text.split('\n').length;
    };

    const getTruncatedText = (text, maxLines) => {
        if (!text) return '';
        const lines = text.split('\n');
        if (lines.length <= maxLines) {
            return text;
        }
        return lines.slice(0, maxLines).join('\n');
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = () => {
        if (logout) {
            logout();
        }
        setShowLogoutModal(false);
        window.location.href = '/login';
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.emoji-picker-container')) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const characterCount = newPostText.length;
    const remainingChars = MAX_CHARACTERS - characterCount;
    const isLimitReached = remainingChars === 0;
    const isNearLimit = remainingChars <= 50;

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="feed-page">
            <div className="feed-container">
                <aside className="sidebar">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Catsgram Logo" className="logo-image" />
                    </div>

                    <nav className="sidebar-nav">
                        <a href="#" className="nav-item active">
                            <span className="nav-icon">📰</span>
                            <span>Лента</span>
                        </a>
                        <a href="#" className="nav-item">
                            <span className="nav-icon">👤</span>
                            <span>Профиль</span>
                        </a>
                    </nav>

                    <div className="sidebar-footer">
                        <button
                            className="logout-menu-btn"
                            onClick={handleLogoutClick}
                        >
                            <span className="nav-icon">🚪</span>
                            <span>Выйти</span>
                        </button>
                    </div>
                </aside>

                <main className="feed-main">
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
                                <button className="remove-image-btn" onClick={handleRemoveImage}>
                                    ✕
                                </button>
                                <span className="image-name">{selectedImage.name}</span>
                            </div>
                        )}

                        <div className="create-post-actions">
                            <div className="create-post-left">
                                <button
                                    className="action-btn"
                                    title="Прикрепить фото"
                                    onClick={handleAttachmentClick}
                                >
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

                                <div className="emoji-picker-container">
                                    <button
                                        className="action-btn"
                                        title="Добавить смайлик"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowEmojiPicker(!showEmojiPicker);
                                        }}
                                        disabled={isLimitReached}
                                    >
                                        😊
                                    </button>

                                    {showEmojiPicker && (
                                        <div className="emoji-picker">
                                            <div className="emoji-categories">
                                                {emojisData.categories.map((category, index) => (
                                                    <button
                                                        key={index}
                                                        className={`emoji-category-tab ${activeCategory === index ? 'active' : ''}`}
                                                        onClick={() => setActiveCategory(index)}
                                                        title={category.name}
                                                    >
                                                        {category.name.split(' ')[0]}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="emoji-content">
                                                <div className="emoji-category-title">
                                                    {emojisData.categories[activeCategory].name}
                                                </div>
                                                <div className="emoji-grid">
                                                    {emojisData.categories[activeCategory].emojis
                                                        .filter(emoji => emoji.trim() !== '')
                                                        .map((emoji) => (
                                                            <button
                                                                key={emoji}
                                                                className="emoji-btn"
                                                                onClick={() => handleEmojiClick(emoji)}
                                                                title={emoji}
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
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

                    <div className="posts-feed">
                        {posts.map((post) => {
                            const isExpanded = expandedPosts[post.id] || false;
                            const lineCount = getLineCount(post.text);
                            const needsTruncate = lineCount > MAX_VISIBLE_LINES;
                            const displayText = needsTruncate && !isExpanded
                                ? getTruncatedText(post.text, MAX_VISIBLE_LINES)
                                : post.text;
                            const showReadMore = needsTruncate && !isExpanded;
                            const showLess = needsTruncate && isExpanded;

                            return (
                                <article key={post.id} className="post-card">
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
                          {post.username}
                            {post.verified && <span className="verified-badge">✅</span>}
                        </span>
                                                <span className="post-time">{post.time || '3 дн.'}</span>
                                            </div>
                                        </div>
                                        <button className="post-menu-btn">⋯</button>
                                    </div>

                                    {displayText && (
                                        <div className="post-text">
                                            {displayText.split('\n').map((line, index) => (
                                                <React.Fragment key={index}>
                                                    {line}
                                                    {index < displayText.split('\n').length - 1 && <br />}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    )}

                                    {showReadMore && (
                                        <button
                                            className="read-more-btn"
                                            onClick={() => togglePostExpand(post.id)}
                                        >
                                            Читать дальше ↓
                                        </button>
                                    )}

                                    {showLess && (
                                        <button
                                            className="read-more-btn"
                                            onClick={() => togglePostExpand(post.id)}
                                        >
                                            Свернуть ↑
                                        </button>
                                    )}

                                    {post.imageUrl && (
                                        <div className="post-image-container">
                                            <img
                                                src={post.imageUrl}
                                                alt="post"
                                                className="post-image"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className="post-stats">
                                        <div className="post-stats-left">
                                            <button className="stat-btn like-btn">
                                                ❤️ <span>{formatCount(post.likes || 0)}</span>
                                            </button>
                                            <button className="stat-btn comment-btn">
                                                💬 <span>{formatCount(post.comments || 0)}</span>
                                            </button>
                                        </div>
                                        <div className="post-stats-right">
                      <span className="stat-btn views-btn">
                        👁️ <span>{formatCount(post.views || 0)}</span>
                      </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </main>
            </div>

            {/* Модальное окно выхода */}
            {showLogoutModal && (
                <LogoutModal
                    onConfirm={handleLogoutConfirm}
                    onCancel={handleLogoutCancel}
                />
            )}

            {/* Уведомление (Toast) */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

function formatCount(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export default Feed;