import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCookie } from '../utils/cookies';
import logo from '../assets/logo.png';
import '../styles/components/Layout.css';

function Layout({ children }) {
    const location = useLocation();
    const userData = getCookie('catsgram_user_data');
    const username = userData ? JSON.parse(userData).username : 'user';

    const isActive = (path) => {
        if (path === '/feed' && location.pathname === '/') return true;
        return location.pathname === path;
    };

    return (
        <div className="layout-page">
            <div className="layout-container">
                {/* Sidebar */}
                <aside className="layout-sidebar">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Catsgram Logo" className="sidebar-logo-image" />
                    </div>

                    <nav className="sidebar-nav">
                        <Link to="/feed" className={`nav-item ${isActive('/feed') || isActive('/') ? 'active' : ''}`}>
                            <span className="nav-icon">📰</span>
                            <span>Лента</span>
                        </Link>

                        <Link to={`/u/${username}`} className={`nav-item ${location.pathname.startsWith('/u/') ? 'active' : ''}`}>
                            <span className="nav-icon">👤</span>
                            <span>Профиль</span>
                        </Link>

                        <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                            <span className="nav-icon">⚙️</span>
                            <span>Настройки</span>
                        </Link>
                    </nav>

                    <div className="sidebar-footer">
                        <Link to="/login" className="nav-item logout-button">
                            <span className="nav-icon">🚪</span>
                            <span>Выйти</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="layout-main">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;