const API_BASE_URL = 'http://localhost:8080';

fetch(`${API_BASE_URL}/posts`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
})
    .then(response => response.json())
    .then(json => console.log(json));

async function createUser() {
    const response = await fetch('http://localhost:8080/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            username: 'testuser'
        })
    });
    const data = await response.json();
    console.log('Создан пользователь:', data);
}

fetch("http://localhost:8080/users")
    .then(response => response.json())
    .then(json => console.log(json))

fetch("http://localhost:8080/posts")
    .then(response => response.json())
    .then(json => console.log(json))




