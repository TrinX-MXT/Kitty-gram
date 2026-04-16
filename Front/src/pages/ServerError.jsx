import React from 'react';
import { useNavigate } from 'react-router-dom';
import cat500 from '../assets/404cat.png';
import './Error.css';

function ServerError() {
    const navigate = useNavigate();

    return (
        <div className="error-page">
            <div className="error-container">
                <img src={cat500} alt="500 Cat" className="cat-image" />

                <h1 className="error-code">500</h1>
                <p className="error-message">Internal Server Error</p>

                <button className="home-button" onClick={() => navigate('/')}>
                    HOME
                </button>
            </div>
        </div>
    );
}

export default ServerError;