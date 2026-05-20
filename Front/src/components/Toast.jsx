import React, { useEffect } from 'react';
import '../styles/components/Toast.css';

function Toast({ message, type = 'error', onClose, duration = 10000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">
                {type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}
            </div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={onClose}>
                ✕
            </button>
        </div>
    );
}

export default Toast;