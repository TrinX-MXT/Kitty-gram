import React from 'react';
import MentionLink from '../components/MentionLink';

/**
 * Парсит текст и оборачивает @упоминания в кликабельные ссылки
 * @param {string} text - Исходный текст
 * @returns {ReactNode[]} - Массив элементов для рендера
 */
export const parseMentions = (text) => {
    if (!text) return [];

    // Regex: @слово (буквы, цифры, подчёркивания, без пробелов)
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        // Текст до упоминания
        if (match.index > lastIndex) {
            const before = text.substring(lastIndex, match.index);
            // Сохраняем переносы строк
            parts.push(
                ...before.split('\n').map((line, i, arr) => (
                    <React.Fragment key={`before-${lastIndex}-${i}`}>
                        {line}
                        {i < arr.length - 1 && <br />}
                    </React.Fragment>
                ))
            );
        }

        // Само упоминание
        const username = match[1];
        parts.push(
            <MentionLink key={`mention-${match.index}`} username={username}>
                {username}
            </MentionLink>
        );

        lastIndex = mentionRegex.lastIndex;
    }

    // Оставшийся текст после последнего упоминания
    if (lastIndex < text.length) {
        const after = text.substring(lastIndex);
        parts.push(
            ...after.split('\n').map((line, i, arr) => (
                <React.Fragment key={`after-${lastIndex}-${i}`}>
                    {line}
                    {i < arr.length - 1 && <br />}
                </React.Fragment>
            ))
        );
    }

    return parts;
};