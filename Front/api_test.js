fetch("http://localhost:5432/posts")
.then(response => response.json())
.then(json => console.log(json))

fetch("http://localhost:5432/users")
    .then(response => response.json())
    .then(json => console.log(json))




