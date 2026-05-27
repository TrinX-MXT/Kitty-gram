import React from 'react';
import logo from '../assets/loader.png';
import '../styles/components/Button.css';

function Button({
                    children,
                    onClick,
                    loading = false,
                    disabled = false,
                    type = 'button',
                    variant = 'primary',
                    size = 'default',
                    className = '',
                    ...props
                }) {
    return (
        <button
            type={type}
            className={`custom-btn ${variant} ${size} ${loading ? 'loading' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="btn-cat-loader">
                    <img src={logo} alt="Loading..." className="cat-loader-image" />
                </div>
            ) : (
                <span className="btn-content">{children}</span>
            )}
        </button>
    );
}

export default Button;