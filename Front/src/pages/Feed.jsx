import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPosts } from '../services/postsApi';
import { getPosts as getMockPosts } from '../services/api';
import emojisData from '../assets/emojis.json';
import LogoutModal from '../components/LogoutModal';
import Toast from '../components/Toast';
import './Feed.css';
import Loader from '../components/Loader';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { getCookie } from '../utils/cookies';
import { addLike, removeLike, hasUserLikedPost } from '../services/likesApi';

const MAX_CHARACTERS = 2048;
const MAX_VISIBLE_LINES = 10;

function Feed({ logout }) {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState({});
    const [newPostText, setNewPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);
    const [expandedPosts, setExpandedPosts] = useState({});
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [toast, setToast] = useState(null); // ← Уведомления
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fileInputRef = useRef(null);
    const textInputRef = useRef(null);

    // Загрузка постов при монтировании
    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        try {
            let posts = await fetchPosts();

            if (!posts || posts.length === 0) {
                console.log('API вернуло пустые данные, используем мок');
                posts = await getMockPosts();
                setToast({
                    message: 'Сервер вернул пустые данные. Показаны тестовые посты.',
                    type: 'error'
                });
            }

            // Загружаем статус лайков для текущего пользователя
            const userData = getCookie('catsgram_user_data');
            const currentUserId = userData ? JSON.parse(userData).id : null;

            if (currentUserId) {
                const likedStatuses = {};

                await Promise.all(
                    posts.map(async (post) => {
                        try {
                            const isLiked = await hasUserLikedPost(post.id, currentUserId);
                            likedStatuses[post.id] = isLiked;
                        } catch (err) {
                            console.log(`Не удалось проверить лайк для поста ${post.id}`);
                            likedStatuses[post.id] = false;
                        }
                    })
                );

                setLikedPosts(likedStatuses);
            }

            setPosts(posts);
        } catch (error) {
            console.error('Ошибка загрузки постов:', error);
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


// Создай НОВУЮ функцию для загрузки дополнительных постов:
    const loadMorePosts = async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        const nextPage = page + 1;

        try {
            const response = await fetch(
                `http://localhost:8080/posts?from=${nextPage * pageSize}&size=${pageSize}&sort=desc`
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const rawPosts = await response.json();

            // Если постов меньше чем pageSize — больше нет
            if (rawPosts.length < pageSize) {
                setHasMore(false);
            }

            if (rawPosts.length === 0) {
                setLoadingMore(false);
                return;
            }

            // Маппинг (такой же как в fetchPosts)
            const newPosts = await Promise.all(rawPosts.map(async (post) => {
                // Загружаем автора
                let author = null;
                try {
                    const authorRes = await fetch(`http://localhost:8080/users/${post.authorId}`);
                    if (authorRes.ok) author = await authorRes.json();
                } catch {}

                // Загружаем изображения
                let imageUrl = null;
                try {
                    const imgRes = await fetch(`http://localhost:8080/posts/${post.id}/images`);
                    if (imgRes.ok) {
                        const images = await imgRes.json();
                        if (images[0]?.id) {
                            imageUrl = `http://localhost:8080/images/${images[0].id}`;
                        }
                    }
                } catch {}

                // Загружаем лайки и комментарии
                let likes = 0, comments = 0;
                try {
                    const [likesRes, commentsRes] = await Promise.all([
                        fetch(`http://localhost:8080/posts/${post.id}/likes`),
                        fetch(`http://localhost:8080/posts/${post.id}/comments`),
                    ]);
                    if (likesRes.ok) likes = (await likesRes.json()).length;
                    if (commentsRes.ok) comments = (await commentsRes.json()).length;
                } catch {}

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
            }));

            // Добавляем новые посты к существующим
            setPosts(prev => [...prev, ...newPosts]);
            setPage(nextPage);

            // Загружаем статус лайков для новых постов
            const userData = getCookie('catsgram_user_data');
            const currentUserId = userData ? JSON.parse(userData).id : null;

            if (currentUserId) {
                const newLikedStatuses = {};
                await Promise.all(
                    newPosts.map(async (post) => {
                        try {
                            const isLiked = await hasUserLikedPost(post.id, currentUserId);
                            newLikedStatuses[post.id] = isLiked;
                        } catch {}
                    })
                );
                setLikedPosts(prev => ({ ...prev, ...newLikedStatuses }));
            }

        } catch (error) {
            console.error('Ошибка загрузки дополнительных постов:', error);
        } finally {
            setLoadingMore(false);
        }
    };

// Обработчик скролла (добавь в useEffect):
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.innerHeight + window.scrollY;
            const documentHeight = document.documentElement.offsetHeight;
            const threshold = 300; // За 300px до конца

            if (scrollTop >= documentHeight - threshold && hasMore && !loadingMore) {
                loadMorePosts();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [page, hasMore, loadingMore]);

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

    // Обработка нажатия на лайк
    const handleLikeToggle = async (postId, currentLikes) => {
        const userData = getCookie('catsgram_user_data');
        const currentUserId = userData ? JSON.parse(userData).id : null;

        if (!currentUserId) {
            setToast({ message: 'Необходимо войти для лайков', type: 'error' });
            return;
        }

        const isCurrentlyLiked = likedPosts[postId] || false;

        try {
            if (isCurrentlyLiked) {
                // Удаляем лайк
                await removeLike(postId, currentUserId);

                // Обновляем состояние локально
                setLikedPosts(prev => ({ ...prev, [postId]: false }));
                setPosts(prev => prev.map(post =>
                    post.id === postId ? { ...post, likes: Math.max(0, (post.likes || 0) - 1) } : post
                ));
            } else {
                // Добавляем лайк
                await addLike(postId, currentUserId);

                // Обновляем состояние локально
                setLikedPosts(prev => ({ ...prev, [postId]: true }));
                setPosts(prev => prev.map(post =>
                    post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
                ));
            }
        } catch (error) {
            console.error('Ошибка при переключении лайка:', error);
            setToast({ message: 'Не удалось обновить лайк', type: 'error' });
        }
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

    // Форматирование даты поста
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

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
    };

    const handlePublish = async () => {
        // Валидация
        if (!newPostText.trim() && !selectedImage) {
            setToast({ message: 'Напишите что-нибудь или добавьте фото', type: 'error' });
            return;
        }

        const userData = getCookie('catsgram_user_data');
        const currentUserId = userData ? JSON.parse(userData).id : null;

        if (!currentUserId) {
            setToast({ message: 'Необходимо войти для публикации', type: 'error' });
            return;
        }

        try {
            // 1. Создаём пост на бэкенде
            const response = await fetch('http://localhost:8080/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authorId: currentUserId,
                    description: newPostText,  // ← description, не text!
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // 2. Парсим ответ от бэкенда (реальная структура)
            const newPost = await response.json();
            // newPost = { id: 9, authorId: 1, description: "...", postDate: "2026-..." }

            // 3. Загружаем автора для отображения
            let authorData = null;
            try {
                const authorRes = await fetch(`http://localhost:8080/users/${currentUserId}`);
                if (authorRes.ok) {
                    authorData = await authorRes.json();
                }
            } catch (e) {
                console.log('Не удалось загрузить автора');
            }

            // 4. Если есть изображение — загружаем
            let imageUrl = null;
            if (selectedImage?.file) {
                try {
                    const formData = new FormData();
                    formData.append('image', selectedImage.file);

                    const imgRes = await fetch(`http://localhost:8080/posts/${newPost.id}/images`, {
                        method: 'POST',
                        body: formData,
                        // Content-Type не указываем — браузер сам поставит multipart/form-data
                    });

                    if (imgRes.ok) {
                        const images = await imgRes.json();
                        if (images[0]?.id) {
                            imageUrl = `http://localhost:8080/images/${images[0].id}`;
                        }
                    }
                } catch (imgError) {
                    console.warn('Не удалось загрузить изображение');
                }
            }

            // 5. Формируем пост для фронтенда (маппинг полей)
            const postForFeed = {
                id: newPost.id,
                authorId: newPost.authorId,
                text: newPost.description,        // ← description → text (для фронтенда)
                createdAt: newPost.postDate,      // ← postDate → createdAt
                time: formatPostDate(newPost.postDate),
                username: authorData?.username || `User${currentUserId}`,
                avatar: authorData?.avatar || null,
                verified: authorData?.verified || false,
                likes: 0,
                comments: 0,
                imageUrl: imageUrl,
            };

            // 6. Добавляем в ленту
            setPosts(prev => [postForFeed, ...prev]);

            // 7. Очищаем форму
            setNewPostText('');
            handleRemoveImage();
            setToast({ message: 'Пост опубликован! 🎉', type: 'success' });

        } catch (error) {
            console.error('Ошибка публикации:', error);

            // Fallback: локальный пост если бэкенд не отвечает
            const localPost = {
                id: Date.now(),
                authorId: currentUserId,
                text: newPostText,
                createdAt: new Date().toISOString(),
                time: 'Только что',
                username: userData ? JSON.parse(userData).username : 'user',
                avatar: null,
                verified: false,
                likes: 0,
                comments: 0,
                imageUrl: selectedImage?.preview || null,
                local: true,
            };

            setPosts(prev => [localPost, ...prev]);
            setNewPostText('');
            handleRemoveImage();
            setToast({ message: 'Пост добавлен локально (сервер недоступен)', type: 'error' });
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
                        <Link to="/feed" className="nav-item active">
                            <span className="nav-icon">📰</span>
                            <span>Лента</span>
                        </Link>
                        <Link
                            to={`/u/${JSON.parse(getCookie('catsgram_user_data'))?.username || 'user'}`}
                            className="nav-item"
                        >
                            <span className="nav-icon">👤</span>
                            <span>Профиль</span>
                        </Link>
                        <Link to="/settings" className="nav-item">
                            <span className="nav-icon">⚙️</span>
                            <span>Настройки</span>
                        </Link>
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
                                        <button className="post-menu-btn">⋯</button>
                                    </div>

                                    {/* Текст поста */}
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

                                    {/* Читать дальше / Свернуть */}
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

                                    {/* Изображение поста */}
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

                                    {/* Статистика: лайки, комментарии, просмотры */}
                                    {/* Статистика: лайки и комментарии (без просмотров) */}
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
                                                onClick={() => navigate(`/post/${post.id}`)}
                                            >
                                                💬 <span>{formatCount(post.comments || 0)}</span>
                                            </button>
                                        </div>
                                        {/* Просмотры убраны */}
                                    </div>
                                </article>
                            );
                        })}

                        {/* Индикатор загрузки новых постов */}
                        {loadingMore && (
                            <div className="loading-more">
                                <div className="spinner"></div>
                                <p>Загрузка...</p>
                            </div>
                        )}

                        {/* Сообщение когда посты кончились */}
                        {!hasMore && posts.length > 0 && !loading && (
                            <div className="no-more-posts">
                                <p>🎉 Все посты загружены!</p>
                            </div>
                        )}

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