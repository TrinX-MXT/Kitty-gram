import React, { useEffect, useState, useRef } from 'react';
import { getPosts } from '../services/api';
import emojisData from '../assets/emojis.json';
import './Feed.css';

const MAX_CHARACTERS = 1000; // Лимит символов

function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostText, setNewPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);

    const fileInputRef = useRef(null);
    const textInputRef = useRef(null);

    useEffect(() => {
        getPosts()
            .then((data) => {
                setPosts(data);
                setLoading(false);
            })
            .catch((err) => console.error('Ошибка загрузки постов:', err));
    }, []);

    // Авто-ресайз textarea
    useEffect(() => {
        if (textInputRef.current) {
            textInputRef.current.style.height = 'auto';
            textInputRef.current.style.height = Math.min(
                textInputRef.current.scrollHeight,
                150 // Максимальная высота
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

        // Проверяем, поместится ли эмодзи
        if (remainingChars < emoji.length) {
            return; // Не добавляем если не хватает места
        }

        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText =
                newPostText.substring(0, start) +
                emoji +
                newPostText.substring(end);

            // Проверяем лимит
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
        return (
            <div className="feed-loading">
                <div className="spinner"></div>
                <p>Загрузка ленты...</p>
            </div>
        );
    }

    return (
        <div className="feed-page">
            <div className="feed-container">
                <aside className="sidebar">
                    <div className="sidebar-logo">
                        <h1>Catsgram</h1>
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
                                className="create-post-input"
                                rows={1}
                            />
                        </div>

                        {/* Счетчик символов */}
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
                                                    {emojisData.categories[activeCategory].emojis.map((emoji) => (
                                                        <button
                                                            key={emoji}
                                                            className="emoji-btn"
                                                            onClick={() => handleEmojiClick(emoji)}
                                                            title={emoji}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                className="publish-btn"
                                onClick={handlePublish}
                                disabled={(!newPostText.trim() && !selectedImage) || isLimitReached}
                            >
                                Опубликовать
                            </button>
                        </div>
                    </div>

                    <div className="posts-feed">
                        {posts.map((post) => (
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

                                {post.text && (
                                    <div className="post-text">
                                        {post.text}
                                    </div>
                                )}

                                {post.imageUrl && (
                                    <div className="post-image-container">
                                        <img src={post.imageUrl} alt="post" className="post-image" />
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
                        ))}
                    </div>
                </main>
            </div>
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