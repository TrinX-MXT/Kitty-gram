import React, { useState, useRef } from 'react';
import { updatePost } from '../services/postsApi';
import { getCookie } from '../utils/cookies';
import emojiData from '../assets/emojis.json';
import '../styles/components/EditPostModal.css';

function EditPostModal({ post, onClose, onUpdate }) {
    const [text, setText] = useState(post.text || '');
    const [hasImage, setHasImage] = useState(post.hasImage || false);
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(post.imageUrl);
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setNewImage(file);
            setImagePreview(preview);
            setHasImage(true);
        }
    };

    const handleRemoveImage = () => {
        setHasImage(false);
        setNewImage(null);
        setImagePreview(null);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const userData = getCookie('catsgram_user_data');
            const userId = userData ? JSON.parse(userData).id : null;

            // Обновляем текст
            const updatedData = { text };

            // Если новое изображение - загружаем
            if (newImage) {
                // Здесь будет API для загрузки изображения
                updatedData.imageUrl = imagePreview;
                updatedData.hasImage = true;
            } else if (!hasImage) {
                updatedData.imageUrl = null;
                updatedData.hasImage = false;
            }

            // Вызываем обновление
            onUpdate(updatedData);

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
          <textarea
              ref={textareaRef}
              className="edit-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Текст поста..."
              rows={6}
          />

                    <div className="emoji-picker-container-edit">
                        <button className="emoji-btn-edit" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                            😊
                        </button>
                        {showEmojiPicker && (
                            <div className="emoji-picker-edit">
                                <div className="emoji-categories-edit">
                                    {emojiData.categories.map((category, index) => (
                                        <button
                                            key={index}
                                            className={`emoji-tab-edit ${activeCategory === index ? 'active' : ''}`}
                                            onClick={() => setActiveCategory(index)}
                                        >
                                            {category.name.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                                <div className="emoji-grid-edit">
                                    {emojiData.categories[activeCategory].emojis
                                        .filter(emoji => emoji.trim() !== '')
                                        .map((emoji) => (
                                            <button
                                                key={emoji}
                                                className="emoji-btn-grid-edit"
                                                onClick={() => handleEmojiClick(emoji)}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="image-section-edit">
                        <label className="section-label-edit">Изображение</label>
                        {imagePreview ? (
                            <div className="image-preview-edit">
                                <img src={imagePreview} alt="preview" />
                                <button className="remove-image-btn-edit" onClick={handleRemoveImage}>
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <label className="upload-btn-edit">
                                📷 Добавить изображение
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    hidden
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="modal-footer-edit">
                    <button className="btn-cancel-edit" onClick={onClose}>Отмена</button>
                    <button className="btn-save-edit" onClick={handleSave} disabled={loading}>
                        {loading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditPostModal;