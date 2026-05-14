# Catsgram Backend

Spring Boot backend for a small social network with posts, images, likes, and comments.

## Architecture

- `controller` — REST API endpoints and request validation.
- `service` — business logic, checks, and orchestration.
- `dao` — JPA repositories.
- `entity` — database entities.
- `dto` — API request/response models.
- `mapper` — entity-to-DTO mapping.
- `exception` — custom exceptions and centralized error handling.

## Database schema

Main tables (see `src/main/resources/schema.sql`):

- `users` — users and registration data.
- `posts` — posts with author and description.
- `images` — images attached to posts.
- `likes` — likes with `post_id`, `user_id`, and timestamp (unique per post/user).
- `comments` — comments with `post_id`, `author_id`, text, and timestamp.

## API overview

Users:
- `GET /users` — list users.
- `GET /users/{userId}` — get user by id.
- `GET /users/{userId}/posts` — list posts by author.
- `POST /users` — create user.
- `PUT /users` — update user.

Posts:
- `GET /posts` — list posts with pagination (`from`, `size`, `sort`).
- `GET /posts/{postId}` — get post by id.
- `POST /posts` — create post.
- `PUT /posts` — update post.
- `GET /posts/{postId}/images` — list post images.

Images:
- `POST /posts/{postId}/images` — upload images.
- `GET /images/{imageId}` — download image.

Likes:
- `POST /posts/{postId}/likes` — add like (body: `userId`).
- `GET /posts/{postId}/likes` — list likes for a post.
- `DELETE /posts/{postId}/likes/{userId}` — remove like.

Comments:
- `POST /posts/{postId}/comments` — add comment (body: `authorId`, `text`).
- `GET /posts/{postId}/comments` — list comments for a post.

## Validation and error handling

The API validates inputs with `jakarta.validation` and returns readable errors via `ErrorHandler`
(`404` for not found, `409` for duplicates, `422` for unmet conditions, `400` for invalid parameters).

## Running locally

```bash
mvn spring-boot:run
```

## Tests

```bash
mvn test
```
