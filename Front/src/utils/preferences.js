// Установка preference cookie
export const setPreference = (key, value, days = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `catsgram_pref_${key}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

// Получение preference cookie
export const getPreference = (key) => {
    const nameEQ = `catsgram_pref_${key}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
};

// Удаление preference cookie
export const removePreference = (key) => {
    document.cookie = `catsgram_pref_${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};