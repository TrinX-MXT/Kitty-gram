// src/components/ErrorBoundary.jsx
import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import cat500 from '../assets/404cat.png';
import '../styles/pages/Error.css';

function ErrorBoundary() {
    const navigate = useNavigate();
    const error = useRouteError();

    return (
        <div className="error-page">
            <div className="error-container">
                <img src={cat500} alt="500 Cat" className="cat-image" />
                <h1 className="error-code">500</h1>
                <p className="error-message">
                    {error?.status === 404 ? 'Not Found' : 'Internal Server Error'}
                </p>
                <button className="home-button" onClick={() => navigate('/')}>
                    HOME
                </button>
            </div>
        </div>
    );
}

export default ErrorBoundary;