import React, { useState, useEffect } from 'react';
import logo from '../assets/loader.png';
import '../styles/components/Loader.css';

// Список забавных текстов для загрузки
const LOADING_MESSAGES = [
    'Загрузка...',
    'Пьём молоко... ',
    'Находим котиков... ',
    'Мурчим... ',
    'Точим коготки... ',
    'Греем лапки... ',
    'Ищем вкусняшки... ',
    'Проверяем миску... ️',
    'Заряжаемся от розетки... ',
    'Гладим виртуальных котиков... ',
    'Считаем хвосты... 1, 2, 3...',
    'Мяукаем в пустоту... ',
    'Ловим зайчиков... ',
    'Смотрим в окно... ',
    'Ура! Почти готово! ',
];

function Loader() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        // Функция для получения случайного индекса (не повторяющего предыдущий)
        const getRandomIndex = (currentIndex) => {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
            } while (newIndex === currentIndex && LOADING_MESSAGES.length > 1);
            return newIndex;
        };

        // Смена текста каждые 2 секунды
        const messageInterval = setInterval(() => {
            setFade(false);

            setTimeout(() => {
                setMessageIndex((prev) => getRandomIndex(prev));
                setFade(true);
            }, 300); // Ждём пока исчезнет
        }, 1000);

        return () => clearInterval(messageInterval);
    }, []);

    return (
        <div className="loader-container">
            <div className="logo-loader">
                <img src={logo} alt="Loading..." className="loader-image" />
                {/* Волны */}
                <div className="wave wave-1"></div>
                <div className="wave wave-2"></div>
                <div className="wave wave-3"></div>
            </div>
            <p className={`loader-text ${fade ? 'fade-in' : 'fade-out'}`}>
                {LOADING_MESSAGES[messageIndex]}
            </p>
        </div>
    );
}

export default Loader;