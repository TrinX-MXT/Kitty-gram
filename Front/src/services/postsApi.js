const API_BASE_URL = 'http://localhost:8080';

// Получение всех постов
export async function fetchPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });



        const data = await response.text();

        // Если пустая строка - возвращаем null
        if (!data || data.trim() === '') {
            return null;
        }

        // Парсим JSON
        const posts = JSON.parse(data);
        console.log(response)

        // Добавляем URL для изображений
        return posts.map(post => ({
            ...post,
            imageUrl: post.id ? `${API_BASE_URL}/posts/${post.id}/images` : null,
        }));

    } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
        throw error;
    }
}

// Публикация нового поста
export async function createPost(text, imageFile) {
    try {
        const formData = new FormData();
        formData.append('text', text);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('catsgram_token')}`,
            },
            body: formData,
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