const API_BASE_URL = 'http://localhost:8080';

// Добавить лайк
export async function addLike(postId, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Ошибка при добавлении лайка:', error);
        throw error;
    }
}

// Удалить лайк
export async function removeLike(postId, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes/${userId}`, {
            method: 'DELETE',
        });

        if (!response.ok && response.status !== 204) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;

    } catch (error) {
        console.error('Ошибка при удалении лайка:', error);
        throw error;
    }
}

// Получить все лайки поста
export async function getPostLikes(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении лайков:', error);
        return [];
    }
}

// Проверить, лайкнул ли текущий пользователь пост
export async function hasUserLikedPost(postId, userId) {
    try {
        const likes = await getPostLikes(postId);
        return likes.some(like => like.userId === userId);
    } catch (error) {
        console.error('Ошибка при проверке лайка:', error);
        return false;
    }
}