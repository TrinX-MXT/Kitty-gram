const API_BASE_URL = 'http://localhost:8080';

// Добавить лайк
export async function addLike(postId, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
            }),
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


export async function getPostLikes(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
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
        console.error('Ошибка при получении лайков:', error);
        throw error;
    }
}


export async function removeLike(postId, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes/${userId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 204 No Content - ничего не возвращаем
        return true;

    } catch (error) {
        console.error('Ошибка при удалении лайка:', error);
        throw error;
    }
}