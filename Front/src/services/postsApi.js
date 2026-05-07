const API_BASE_URL = 'http://localhost:8080';

// Получение всех постов с полной информацией
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

        const rawPosts = await response.json();

        // Загружаем полную информацию для каждого поста
        const postsWithDetails = await Promise.all(
            rawPosts.map(async (post) => {
                const [author, likes, comments, images] = await Promise.all([
                    fetchAuthor(post.authorId),
                    fetchPostLikes(post.id),
                    fetchPostComments(post.id),
                    fetchPostImages(post.id),
                ]);

                return {
                    // Основные поля
                    id: post.id,
                    authorId: post.authorId,

                    // Маппинг полей
                    text: post.description || '',
                    createdAt: post.postDate,
                    time: formatPostDate(post.postDate),

                    // Автор
                    username: author?.username || `User${post.authorId}`,
                    avatar: author?.avatar || null,
                    verified: author?.verified || false,

                    // Статистика
                    likes: likes?.length || 0,
                    comments: comments?.length || 0,

                    // Изображения
                    imageUrl: images?.[0]?.url || null,
                    hasImages: images?.length > 0,
                };
            })
        );

        return postsWithDetails;

    } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
        throw error;
    }
}

// Получение автора по ID
async function fetchAuthor(authorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${authorId}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (err) {
        console.log(`Не удалось загрузить автора ${authorId}`);
        return null;
    }
}

// Получение лайков поста
async function fetchPostLikes(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`);
        if (!response.ok) return [];
        return await response.json();
    } catch (err) {
        console.log(`Не удалось загрузить лайки для поста ${postId}`);
        return [];
    }
}

// Получение комментариев поста
async function fetchPostComments(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
        if (!response.ok) return [];
        return await response.json();
    } catch (err) {
        console.log(`Не удалось загрузить комментарии для поста ${postId}`);
        return [];
    }
}

// Получение изображений поста
async function fetchPostImages(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/images`);
        if (!response.ok) return [];
        const images = await response.json();

        // Формируем URL для изображений
        return images.map(img => ({
            id: img.id,
            url: `${API_BASE_URL}/images/${img.id}`,
            fileName: img.originalFileName,
        }));
    } catch (err) {
        console.log(`Не удалось загрузить изображения для поста ${postId}`);
        return [];
    }
}

// Форматирование даты
function formatPostDate(isoString) {
    if (!isoString) return '3 дн.';

    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Только что';
    if (diffHours < 24) return `${diffHours} ч.`;
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн.`;

    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
    });
}

// Получение поста по ID
export async function getPostById(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении поста:', error);
        throw error;
    }
}

// Создание поста
export async function createPost(authorId, description) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authorId, description }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Ошибка при создании поста:', error);
        throw error;
    }
}