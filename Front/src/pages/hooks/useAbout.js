import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export function useAbout() {
    const { theme } = useTheme();

    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [hoveredAuthor, setHoveredAuthor] = useState(null);
    const [hoveredBack, setHoveredBack] = useState(false);

    // ── Данные ────────────────────────────────────────────────────────────────

    const features = [
        { icon: '📝', title: 'Публикация постов',      text: 'Делитесь фото и текстом' },
        { icon: '❤️', title: 'Лайки и комментарии',    text: 'Взаимодействуйте с контентом' },
        { icon: '🌙', title: 'Тема',                   text: 'Переключение между темами' },
        { icon: '📊', title: 'Статистика',             text: 'Аналитика и дашборды (пока нет)' },
        { icon: '🔐', title: 'JWT',                    text: 'Безопасный вход и регистрация' },
        { icon: '📱', title: 'Адаптивность',           text: 'Работает на всех устройствах' },
    ];

    const authors = [
        {
            href: 'https://github.com/TrinX-MXT',
            avatar: 'https://avatars.githubusercontent.com/u/187986135?s=400&u=a1d921b32153e495d9ffbcf05666e4f687f3ab69&v=4',
            name: 'TrinXy',
            role: 'Frontend - разработчик',
        },
        {
            href: 'https://github.com/Xmelnoy',
            avatar: 'https://avatars.githubusercontent.com/u/147347230?v=4',
            name: 'Xmelnoy',
            role: 'Backend/DB - разработчик',
        },
        {
            href: 'https://github.com/aniseropian',
            avatar: 'https://avatars.githubusercontent.com/u/187175448?v=4',
            name: 'aniseropian',
            role: 'SCRUM - мастер',
        },
    ];

    const techStack = [
        '⚛️ React', '🚀 Vite', '🎨 HTML + CSS + JS',
        '🔗 React Router', '☕ Java/Spring (Backend)',
    ];

    // ── Стили ─────────────────────────────────────────────────────────────────

    const isDark = theme === 'dark';

    const styles = {
        page: {
            minHeight: '100vh',
            backgroundColor: isDark ? '#0f0f0f' : '#f5f5f5',
            color: isDark ? '#ffffff' : '#1a1a1a',
            padding: '40px 20px',
            transition: 'all 0.3s ease',
        },
        container:   { maxWidth: '800px', margin: '0 auto' },
        header:      { textAlign: 'center', marginBottom: '48px' },
        logoImage:   { maxWidth: '500px', width: '100%', height: 'auto', display: 'block', margin: '0 auto 16px auto' },
        subtitle:    { fontSize: '18px', color: isDark ? '#888888' : '#666666', margin: 0 },
        section: {
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${isDark ? '#2a2a2a' : '#e0e0e0'}`,
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
            transition: 'all 0.3s ease',
        },
        sectionTitle: { fontSize: '24px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' },
        paragraph:    { fontSize: '16px', lineHeight: '1.8', color: isDark ? '#e0e0e0' : '#333333', marginBottom: '16px' },
        featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' },
        featureCard: {
            backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
            border: `1px solid ${isDark ? '#2a2a2a' : '#e0e0e0'}`,
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            transition: 'transform 0.2s',
        },
        featureIcon:  { fontSize: '32px', marginBottom: '12px' },
        featureTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '8px' },
        featureText:  { fontSize: '14px', color: isDark ? '#888888' : '#666666', margin: 0 },
        authorsList:  { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' },
        authorCard: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
            border: `1px solid ${isDark ? '#2a2a2a' : '#e0e0e0'}`,
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s',
        },
        authorInfo:  { flex: 1 },
        authorName:  { fontSize: '18px', fontWeight: '600', marginBottom: '4px' },
        authorRole:  { fontSize: '14px', color: isDark ? '#888888' : '#666666' },
        techStack:   { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' },
        techBadge: {
            padding: '8px 16px',
            backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0',
            border: `1px solid ${isDark ? '#2a2a2a' : '#e0e0e0'}`,
            borderRadius: '20px',
            fontSize: '14px',
            color: isDark ? '#e0e0e0' : '#333333',
        },
        backButton: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0',
            border: `1px solid ${isDark ? '#2a2a2a' : '#e0e0e0'}`,
            borderRadius: '12px',
            color: 'inherit',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '32px',
            transition: 'all 0.2s',
        },
        footer: { textAlign: 'center', marginTop: '40px', color: isDark ? '#666' : '#999', fontSize: '14px' },
    };

    // ── Динамические стили с ховером ──────────────────────────────────────────

    const getFeatureStyle = (index) => ({
        ...styles.featureCard,
        transform: hoveredFeature === index ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hoveredFeature === index ? '0 8px 24px rgba(99, 102, 241, 0.2)' : 'none',
    });

    const getAuthorStyle = (index) => ({
        ...styles.authorCard,
        borderColor: hoveredAuthor === index ? '#6366f1' : styles.authorCard.borderColor,
        transform: hoveredAuthor === index ? 'translateX(4px)' : 'translateX(0)',
    });

    const getAvatarStyle = (index) => ({
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        border: `2px solid ${hoveredAuthor === index ? '#6366f1' : 'transparent'}`,
        transition: 'border-color 0.2s',
    });

    const getBackButtonStyle = () => ({
        ...styles.backButton,
        backgroundColor: hoveredBack
            ? (isDark ? '#2a2a2a' : '#e0e0e0')
            : styles.backButton.backgroundColor,
    });

    return {
        // Данные
        features,
        authors,
        techStack,

        // Стили
        styles,
        getFeatureStyle,
        getAuthorStyle,
        getAvatarStyle,
        getBackButtonStyle,

        // Hover-обработчики
        setHoveredFeature,
        setHoveredAuthor,
        setHoveredBack,
    };
}