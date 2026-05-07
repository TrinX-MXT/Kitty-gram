const API_BASE_URL = 'http://localhost:8080';

fetch(`${API_BASE_URL}/posts`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
})
    .then(response => response.json())
    .then(json => console.log(json));


fetch("http://localhost:8080/users")
    .then(response => response.json())
    .then(json => console.log(json))

fetch("http://localhost:8080/posts")
    .then(response => response.json())
    .then(json => console.log(json))




