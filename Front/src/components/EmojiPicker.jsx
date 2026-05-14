import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import emojisData from '../assets/emojis.json';
import './EmojiPicker.css';

function EmojiPicker({ onEmojiSelect, anchorRef, onClose }) {
    const pickerRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [activeCategory, setActiveCategory] = useState(0);
    const [mounted, setMounted] = useState(false);

    // Вычисляем позицию относительно кнопки
    useEffect(() => {
        setMounted(true);

        if (anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            const pickerWidth = 320;
            const pickerHeight = 400;

            // Позиционируем над кнопкой
            let top = rect.top - pickerHeight - 10;
            let left = rect.left;

            // Не даём уйти за границы экрана
            if (top < 10) top = rect.bottom + 10;
            if (left + pickerWidth > window.innerWidth) {
                left = window.innerWidth - pickerWidth - 10;
            }
            if (left < 10) left = 10;

            setPosition({ top, left });
        }

        return () => setMounted(false);
    }, [anchorRef]);

    // Закрытие по клику вне
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(e.target) &&
                anchorRef?.current &&
                !anchorRef.current.contains(e.target)
            ) {
                onClose?.();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [anchorRef, onClose]);

    const handleEmojiClick = (emoji) => {
        onEmojiSelect?.(emoji);
    };

    // Если не смонтирован — не рендерим (для portal)
    if (!mounted) return null;

    // Сам контент пикера
    const PickerContent = (
        <div
            ref={pickerRef}
            className="emoji-picker-portal"
            onClick={(e) => e.stopPropagation()}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            <div className="emoji-categories">
                {emojisData.categories.map((category, index) => (
                    <button
                        key={index}
                        className={`emoji-category-tab ${activeCategory === index ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveCategory(index); }}
                        title={category.name}
                        type="button"
                    >
                        {category.name.split(' ')[0]}
                    </button>
                ))}
            </div>

            <div className="emoji-content">
                <div className="emoji-category-title">
                    {emojisData.categories[activeCategory].name}
                </div>
                <div className="emoji-grid">
                    {emojisData.categories[activeCategory].emojis
                        .filter(emoji => emoji.trim() !== '')
                        .map((emoji) => (
                            <button
                                key={emoji}
                                className="emoji-btn"
                                onClick={(e) => { e.stopPropagation(); handleEmojiClick(emoji); }}
                                title={emoji}
                                type="button"
                            >
                                {emoji}
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );

    // Рендерим через портал в body
    return createPortal(PickerContent, document.body);
}

export default EmojiPicker;