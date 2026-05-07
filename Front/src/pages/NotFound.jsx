import React from 'react';
import { useNavigate } from 'react-router-dom';
import cat404 from '../assets/404cat.png';
import './Error.css';

function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="error-page">
            <div className="error-container">
                <img src={cat404} alt="404 Cat" className="cat-image" />

                <h1 className="error-code">404</h1>
                <p className="error-message">Not Found</p>

                <button className="home-button" onClick={() => navigate('/')}>
                    HOME
                </button>
            </div>
        </div>
    );
}

export default NotFound;