import React from 'react';
import './LogoutModal.css';

function LogoutModal({ onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Выход из аккаунта</h2>
                <p className="modal-text">Вы точно хотите выйти из аккаунта?</p>
                <div className="modal-buttons">
                    <button className="modal-btn stay-btn" onClick={onCancel}>
                        Остаться
                    </button>
                    <button className="modal-btn logout-btn" onClick={onConfirm}>
                        Выйти
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LogoutModal;