import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';

function About() {
    const { theme } = useTheme();

    // Стили объекта (CSS-in-JS подход)
    const styles = {
        page: {
            minHeight: '100vh',
            backgroundColor: theme === 'dark' ? '#0f0f0f' : '#f5f5f5',
            color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
            padding: '40px 20px',
            transition: 'all 0.3s ease',
        },
        container: {
            maxWidth: '800px',
            margin: '0 auto',
        },
        header: {
            textAlign: 'center',
            marginBottom: '48px',
        },
        logoImage: {
            maxWidth: '500px',
            width: '100%',
            height: 'auto',
            display: 'block',
            margin: '0 auto 16px auto',
        },
        subtitle: {
            fontSize: '18px',
            color: theme === 'dark' ? '#888888' : '#666666',
            margin: 0,
        },
        section: {
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
            transition: 'all 0.3s ease',
        },
        sectionTitle: {
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        paragraph: {
            fontSize: '16px',
            lineHeight: '1.8',
            color: theme === 'dark' ? '#e0e0e0' : '#333333',
            marginBottom: '16px',
        },
        featuresGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '20px',
        },
        featureCard: {
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f9f9f9',
            border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            transition: 'transform 0.2s',
        },
        featureIcon: {
            fontSize: '32px',
            marginBottom: '12px',
        },
        featureTitle: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px',
        },
        featureText: {
            fontSize: '14px',
            color: theme === 'dark' ? '#888888' : '#666666',
            margin: 0,
        },
        authorsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginTop: '20px',
        },
        authorCard: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f9f9f9',
            border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s',
        },
        authorAvatar: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            flexShrink: 0,
        },
        authorInfo: {
            flex: 1,
        },
        authorName: {
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '4px',
        },
        authorRole: {
            fontSize: '14px',
            color: theme === 'dark' ? '#888888' : '#666666',
        },
        techStack: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginTop: '16px',
        },
        techBadge: {
            padding: '8px 16px',
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f0f0f0',
            border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
            borderRadius: '20px',
            fontSize: '14px',
            color: theme === 'dark' ? '#e0e0e0' : '#333333',
        },
        backButton: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f0f0f0',
            border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
            borderRadius: '12px',
            color: 'inherit',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '32px',
            transition: 'all 0.2s',
        },
    };

    // Hover эффекты через inline style не работают, поэтому используем onMouseEnter/onMouseLeave
    const [hoveredFeature, setHoveredFeature] = React.useState(null);
    const [hoveredAuthor, setHoveredAuthor] = React.useState(null);
    const [hoveredBack, setHoveredBack] = React.useState(false);

    const getFeatureStyle = (index) => ({
        ...styles.featureCard,
        transform: hoveredFeature === index ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hoveredFeature === index
            ? '0 8px 24px rgba(99, 102, 241, 0.2)'
            : 'none',
    });

    const getAuthorStyle = (index) => ({
        ...styles.authorCard,
        borderColor: hoveredAuthor === index ? '#6366f1' : styles.authorCard.borderColor,
        transform: hoveredAuthor === index ? 'translateX(4px)' : 'translateX(0)',
    });

    const getBackButtonStyle = () => ({
        ...styles.backButton,
        backgroundColor: hoveredBack
            ? (theme === 'dark' ? '#2a2a2a' : '#e0e0e0')
            : styles.backButton.backgroundColor,
    });

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
                    <h2 style={styles.sectionTitle}>
                        📖 О проекте
                    </h2>
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

                    {/* Технологии */}
                    <div style={{ marginTop: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                            🛠️ Технологии:
                        </h3>
                        <div style={styles.techStack}>
                            <span style={styles.techBadge}>⚛️ React</span>
                            <span style={styles.techBadge}>🚀 Vite</span>
                            <span style={styles.techBadge}>🎨 HTML + CSS + JS</span>
                            <span style={styles.techBadge}>🔗 React Router</span>
                            <span style={styles.techBadge}>☕ Java/Spring (Backend)</span>
                        </div>
                    </div>
                </div>

                {/* Возможности */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        ✨ Возможности
                    </h2>
                    <div style={styles.featuresGrid}>
                        {[
                            { icon: '📝', title: 'Публикация постов', text: 'Делитесь фото и текстом' },
                            { icon: '❤️', title: 'Лайки и комментарии', text: 'Взаимодействуйте с контентом' },
                            { icon: '🌙', title: 'Тема', text: 'Переключение между темами' },
                            { icon: '📊', title: 'Статистика', text: 'Аналитика и дашборды (пока нет)' },
                            { icon: '🔐', title: 'JWT', text: 'Безопасный вход и регистрация' },
                            { icon: '📱', title: 'Адаптивность', text: 'Работает на всех устройствах' },
                        ].map((feature, index) => (
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
                    <h2 style={styles.sectionTitle}>
                        👥 Авторы проекта
                    </h2>
                    <p style={styles.paragraph}>
                        Проект разработан студентами "МосТех"
                    </p>


                    <div style={styles.authorsList}>
                        {/* Автор 1 - ЗАМЕНИ НА СВОИ ДАННЫЕ */}
                        <a
                            href="https://github.com/TrinX-MXT"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={getAuthorStyle(0)}
                            onMouseEnter={() => setHoveredAuthor(0)}
                            onMouseLeave={() => setHoveredAuthor(null)}
                        >
                            <img
                                src="https://avatars.githubusercontent.com/u/187986135?s=400&u=a1d921b32153e495d9ffbcf05666e4f687f3ab69&v=4"
                                alt="Author avatar"
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    flexShrink: 0,
                                    border: `2px solid ${hoveredAuthor === 0 ? '#6366f1' : 'transparent'}`,
                                    transition: 'border-color 0.2s',
                                }}
                            />
                            <div style={styles.authorInfo}>
                                <div style={styles.authorName}>TrinXy</div>
                                <div style={styles.authorRole}>Frontend - разработчик</div>
                            </div>
                            <span style={{ fontSize: '20px' }}>🔗</span>
                        </a>

                        {/* Автор 2 - добавь если нужно */}
                        <a
                            href="https://github.com/Xmelnoy"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={getAuthorStyle(1)}
                            onMouseEnter={() => setHoveredAuthor(1)}
                            onMouseLeave={() => setHoveredAuthor(null)}
                        >
                            <img
                                src="https://avatars.githubusercontent.com/u/147347230?v=4"
                                alt="Another Dev"
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    flexShrink: 0,
                                    border: `2px solid ${hoveredAuthor === 1 ? '#6366f1' : 'transparent'}`,
                                    transition: 'border-color 0.2s',
                                }}
                            />
                            <div style={styles.authorInfo}>
                                <div style={styles.authorName}>Xmelnoy</div>
                                <div style={styles.authorRole}>Backend/DB - разработчик</div>
                            </div>
                            <span style={{ fontSize: '20px' }}>🔗</span>
                        </a>

                        {/* Автор 3 - добавь если нужно */}
                        <a
                            href="https://github.com/aniseropian"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={getAuthorStyle(2)}
                            onMouseEnter={() => setHoveredAuthor(2)}
                            onMouseLeave={() => setHoveredAuthor(null)}
                        >
                            <img
                                src="https://avatars.githubusercontent.com/u/187175448?v=4"
                                alt="Anon"
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    flexShrink: 0,
                                    border: `2px solid ${hoveredAuthor === 2 ? '#6366f1' : 'transparent'}`,
                                    transition: 'border-color 0.2s',
                                }}
                            />
                            <div style={styles.authorInfo}>
                                <div style={styles.authorName}>aniseropian</div>
                                <div style={styles.authorRole}>SCRUM - мастер</div>
                            </div>
                            <span style={{ fontSize: '20px' }}>🔗</span>
                        </a>

                    </div>
                </div>

                {/* Футер */}
                <div style={{ textAlign: 'center', marginTop: '40px', color: theme === 'dark' ? '#666' : '#999', fontSize: '14px' }}>
                    <p style={{ margin: '8px 0' }}>© 2026 Catsgram. Прав нет, возможно.</p>
                    <p style={{ margin: '8px 0' }}>Сделано с ❤️ для любителей котиков</p>
                </div>
            </div>
        </div>
    );
}

export default About;