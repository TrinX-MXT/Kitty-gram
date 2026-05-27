import React from 'react';
import { Link } from 'react-router-dom';
import { useAbout } from './hooks/useAbout';
import logo from '../assets/logo.png';

function About() {
    const {
        features,
        authors,
        techStack,
        styles,
        getFeatureStyle,
        getAuthorStyle,
        getAvatarStyle,
        getBackButtonStyle,
        setHoveredFeature,
        setHoveredAuthor,
        setHoveredBack,
    } = useAbout();

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Кнопка назад */}
                <Link
                    to="/feed"
                    style={getBackButtonStyle()}
                    onMouseEnter={() => setHoveredBack(true)}
                    onMouseLeave={() => setHoveredBack(false)}
                >
                    ← На главную
                </Link>

                {/* Заголовок */}
                <div style={styles.header}>
                    <img src={logo} alt="Catsgram Logo" style={styles.logoImage} />
                    <p style={styles.subtitle}>Социальная сеть для любителей котиков 🐱</p>
                </div>

                {/* О проекте */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>📖 О проекте</h2>
                    <p style={styles.paragraph}>
                        <strong>Catsgram</strong> — это студенческий проект - социальная сеть,
                        созданная для объединения любителей кошек. Делитесь
                        фотографиями ваших пушистых друзей, находите новых друзей и
                        наслаждайтесь бесконечным потоком милых моментов!
                    </p>
                    <p style={styles.paragraph}>
                        Проект разработан с использованием современных веб-технологий и
                        направлен на создание удобного, быстрого и красивого интерфейса
                        для общения и обмена контентом.
                    </p>
                    <div style={{ marginTop: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                            🛠️ Технологии:
                        </h3>
                        <div style={styles.techStack}>
                            {techStack.map((tech) => (
                                <span key={tech} style={styles.techBadge}>{tech}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Возможности */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>✨ Возможности</h2>
                    <div style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                style={getFeatureStyle(index)}
                                onMouseEnter={() => setHoveredFeature(index)}
                                onMouseLeave={() => setHoveredFeature(null)}
                            >
                                <div style={styles.featureIcon}>{feature.icon}</div>
                                <div style={styles.featureTitle}>{feature.title}</div>
                                <p style={styles.featureText}>{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Авторы */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>👥 Авторы проекта</h2>
                    <p style={styles.paragraph}>Проект разработан студентами "МосТех"</p>
                    <div style={styles.authorsList}>
                        {authors.map((author, index) => (
                            <a
                                key={index}
                                href={author.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={getAuthorStyle(index)}
                                onMouseEnter={() => setHoveredAuthor(index)}
                                onMouseLeave={() => setHoveredAuthor(null)}
                            >
                                <img
                                    src={author.avatar}
                                    alt={author.name}
                                    style={getAvatarStyle(index)}
                                />
                                <div style={styles.authorInfo}>
                                    <div style={styles.authorName}>{author.name}</div>
                                    <div style={styles.authorRole}>{author.role}</div>
                                </div>
                                <span style={{ fontSize: '20px' }}>🔗</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Футер */}
                <div style={styles.footer}>
                    <p style={{ margin: '8px 0' }}>© 2026 Catsgram. Прав нет, возможно.</p>
                    <p style={{ margin: '8px 0' }}>Сделано с ❤️ для любителей котиков</p>
                </div>
            </div>
        </div>
    );
}

export default About;