import React, { useState, useRef } from 'react';
import { getCookie } from '../utils/cookies';
import '../styles/components/EditPostModal.css';

function EditPostModal({ post, onClose, onUpdate }) {
    const [text, setText] = useState(post.text || '');
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textareaRef = useRef(null);

    const handleEmojiClick = (emoji) => {
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText = text.substring(0, start) + emoji + text.substring(end);
            setText(newText);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + emoji.length, start + emoji.length);
            }, 0);
        } else {
            setText(prev => prev + emoji);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Отправляем только текст — изображение не меняем
            onUpdate({ text });  // ← Только text, без image-related полей
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay-edit" onClick={onClose}>
            <div className="modal-content-edit" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-edit">
                    <h2>Редактировать пост</h2>
                    <button className="modal-close-edit" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body-edit">
                    {/* Текст поста */}
                    <textarea
                        ref={textareaRef}
                        className="edit-textarea"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Текст поста..."
                        rows={6}
                    />

                    {/* Изображение — ТОЛЬКО ПРОСМОТР */}
                    {post.imageUrl && (
                        <div className="image-section-edit">
                            <label className="section-label-edit">Изображение</label>
                            <div className="image-preview-edit readonly">
                                <img src={post.imageUrl} alt="post" />

                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer-edit">
                    <button className="btn-cancel-edit" onClick={onClose}>Отмена</button>
                    <button className="btn-save-edit" onClick={handleSave} disabled={loading || !text.trim()}>
                        {loading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditPostModal;