import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCookie } from '../utils/cookies';
import avatarPlaceholder from '../assets/avatar-placeholder.png';
import Button from '../components/Button';
import './Profile.css';
import Loader from "../components/Loader.jsx";
import Layout from "../components/Layout.jsx";

function Profile() {
    const { username } = useParams();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    useEffect(() => {
        loadProfile();
    }, [username]);

    const loadProfile = async () => {
        setLoading(true);

        try {
            const userData = getCookie('catsgram_user_data');
            const currentUser = userData ? JSON.parse(userData) : null;

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

                try {
                    const postsResponse = await fetch(`http://localhost:8080/users/${currentUser.id}/posts`);
                    if (postsResponse.ok) {
                        const postsData = await postsResponse.json();
                        setPosts(postsData);
                    }
                } catch (err) {
                    console.log('Не удалось загрузить посты');
                    setPosts([]);
                }

            } else {
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

                            try {
                                const postsResponse = await fetch(`http://localhost:8080/users/${foundUser.id}/posts`);
                                if (postsResponse.ok) {
                                    const postsData = await postsResponse.json();
                                    setPosts(postsData);
                                }
                            } catch (err) {
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
                    console.error('Ошибка загрузки профиля:', err);
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

    if (loading) {
        return <Loader />;
    }

    if (!profile) {
        return null;
    }

    return (
        <Layout>
            <div className="profile-page">
                <div
                    className="profile-cover"
                    style={{
                        backgroundImage: profile.cover ? `url(${profile.cover})` : 'linear-gradient(135deg, #6366f1, #a855f7)'
                    }}
                />

                <div className="profile-container">
                    <div className="profile-avatar-wrapper">
                        <img
                            src={profile.avatar || avatarPlaceholder}
                            alt={profile.username}
                            className="profile-avatar"
                        />
                    </div>

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

                    <div className="profile-posts">
                        <h2 className="section-title">Посты</h2>

                        {posts.length > 0 ? (
                            <div className="posts-grid">
                                {posts.map(post => (
                                    <div key={post.id} className="post-card">
                                        {post.imageUrl ? (
                                            <img src={post.imageUrl} alt="post" />
                                        ) : (
                                            <div className="post-text-preview">{post.text || post.content}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-posts">
                                <p>😿 Нет постов</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Profile;