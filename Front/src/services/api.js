

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


// Пока игорь не сделает БД херачим через моки
const MOCK_POSTS = [
    {
        id: 1,
        username: "Dark",
        avatar: null,
        verified: true,
        text: "Ща белые огребут",
        imageUrl: "https://i.imgur.com/example1.jpg",
        likes: 3500,
        comments: 56,
        views: 31800,
        time: "3 дн.",
    },
    {
        id: 2,
        username: "Sigmashishka",
        avatar: null,
        verified: false,
        text: "Кста оцените мою банковскую карточку",
        imageUrl: null, // Нет изображения - только текст!
        likes: 892,
        comments: 124,
        views: 15200,
        time: "54 мин. (ред.)",
    },
    {
        id: 3,
        username: "murzik_king",
        avatar: null,
        verified: false,
        text: "Мяу! Сегодня отличный день для сна. Ничего не делал весь день и это прекрасно 😺",
        imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600",
        likes: 1240,
        comments: 89,
        views: 22100,
        time: "2 ч.",
    },
    {
        id: 4,
        username: "baron_cat",
        avatar: null,
        verified: true,
        text: "— А праздник английского посланника? Нынче середа. Мне надо показаться там, — сказал князь.\n" +
            "\n" +
            "\n" +
            "\n" +
            "\n" +
            "— Eh bien, mon prince. Gênes et Lucques ne sont plus que des apanages, des поместья, de la famille Buonaparte. Non, je vous préviens que si vous ne me dites pas que nous avons la guerre, si vous vous permettez encore de pallier toutes les infamies, toutes les atrocités de cet Antichrist (ma parole, j'y crois) — je ne vous connais plus, vous n'êtes plus mon ami, vous n'êtes plus мой верный раб, comme vous dites 1. Ну, здравствуйте, здравствуйте. Je vois que je vous fais peur 2, садитесь и рассказывайте.\n" +
            "\n" +
            "\n" +
            "\n" +
            "Eh bien, mon prince. Gênes et Lucques ne sont plus que des apanages, des поместья, de la famille Buonaparte. Non, je vous préviens que si vous ne me dites pas que nous avons la guerre\n" +
            "\n" +
            "\n" +
            "Eh bien, mon prince. Gênes et Lucques ne sont plus que des apanages, des поместья, de la famille Buonaparte. Non, je vous préviens que si vous ne me dites pas que nous avons la guerre \n" +
            "\n" +
            "\n" +
            "\n" +
            "\n" +
            "\n" +
            "\n" +
            "\n" +
            "\n" +
            "\n" +
            "\n" +
            "\n" +
            "\n" +
            "DDDDDDD",
        imageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600",
        likes: 856,
        comments: 43,
        views: 18900,
        time: "5 ч.",
    },
    {
        id: 5,
        username: "text_only_user",
        avatar: null,
        verified: false,
        text: "Просто текст без картинки. Работает ли условный рендеринг? 🤔",
        imageUrl: null, // Тоже без изображения
        likes: 234,
        comments: 12,
        views: 5600,
        time: "1 ч.",
    },
];

export async function getPosts() {
    await delay(600);
    return MOCK_POSTS;
}

export async function registerUser(username, password) {
    await delay(1000);
    if (username.length < 3) {
        throw new Error("Имя слишком короткое");
    }
    return { token: "fake-jwt-token-" + Date.now(), username };
}