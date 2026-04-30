const API_BASE_URL = 'http://localhost:8080';


export async function fetchPosts(from = 0, size = 10, sort = 'desc') {
    try {
        const params = new URLSearchParams({
            from: from.toString(),
            size: size.toString(),
            sort: sort,
        });

        const response = await fetch(`${API_BASE_URL}/posts?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const posts = await response.json();

        // Добавляем URL для изображений
        return posts.map(post => ({
            ...post,
            imagesUrl: `${API_BASE_URL}/posts/${post.id}/images`,
        }));

    } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
        throw error;
    }
}


export async function getPostById(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
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
        console.error('Ошибка при получении поста:', error);
        throw error;
    }
}


export async function getPostImages(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/images`, {
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
        console.error('Ошибка при получении изображений:', error);
        throw error;
    }
}

// Создание поста
export async function createPost(authorId, content) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                authorId,
                content,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Ошибка при создании поста:', error);
        throw error;
    }
}

// Обновление поста
export async function updatePost(postId, authorId, content) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: postId,
                authorId,
                content,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Ошибка при обновлении поста:', error);
        throw error;
    }
}

// Загрузка изображений для поста
export async function uploadPostImages(postId, files) {
    try {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('image', file);
        });

        const response = await fetch(`${API_BASE_URL}/posts/${postId}/images`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Ошибка при загрузке изображений:', error);
        throw error;
    }
}

// Скачивание изображения
export async function downloadImage(imageId) {
    try {
        const response = await fetch(`${API_BASE_URL}/images/${imageId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.blob();

    } catch (error) {
        console.error('Ошибка при скачивании изображения:', error);
        throw error;
    }
}