const API_BASE_URL = 'http://localhost:8080';

// Добавить комментарий
export async function addComment(postId, authorId, text) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authorId, text }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (response.status === 500) {
            window.location.replace('/error');
            return;
        }

        return await response.json();

    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
        throw error;
    }
}

// Получить все комментарии поста
export async function getPostComments(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (response.status === 500) {
            window.location.replace('/error');
            return;
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении комментариев:', error);
        return [];
    }
}

// Получить автора комментария
export async function getCommentAuthor(authorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${authorId}`);
        if (!response.ok) return null;
        if (response.status === 500) {
            window.location.replace('/error');
            return;
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении автора:', error);
        return null;
    }
}