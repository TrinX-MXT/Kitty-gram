const API_BASE_URL = 'http://localhost:8080';

// Добавить комментарий
export async function addComment(postId, userId, text) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                text,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
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
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Ошибка при получении комментариев:', error);
        throw error;
    }
}