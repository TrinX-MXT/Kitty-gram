package ru.yandex.practicum.catsgram.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PostInteractionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateLike() throws Exception {
        long userId = createUser();
        long postId = createPost(userId);

        mockMvc.perform(post("/posts/{postId}/likes", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createLikeRequest(userId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(userId));
    }

    @Test
    void shouldReturnPostLikes() throws Exception {
        long userId = createUser();
        long postId = createPost(userId);

        mockMvc.perform(post("/posts/{postId}/likes", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createLikeRequest(userId)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/posts/{postId}/likes", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(userId));
    }

    @Test
    void shouldRejectDuplicateLike() throws Exception {
        long userId = createUser();
        long postId = createPost(userId);

        mockMvc.perform(post("/posts/{postId}/likes", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createLikeRequest(userId)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/posts/{postId}/likes", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createLikeRequest(userId)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void shouldCreateComment() throws Exception {
        long userId = createUser();
        long postId = createPost(userId);

        mockMvc.perform(post("/posts/{postId}/comments", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createCommentRequest(userId, "Nice post")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.authorId").value(userId))
                .andExpect(jsonPath("$.text").value("Nice post"));
    }

    @Test
    void shouldReturnComments() throws Exception {
        long userId = createUser();
        long postId = createPost(userId);

        mockMvc.perform(post("/posts/{postId}/comments", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createCommentRequest(userId, "Nice post")))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/posts/{postId}/comments", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].text").value("Nice post"));
    }

    private long createUser() throws Exception {
        String userRequest = objectMapper.writeValueAsString(Map.of(
                "username", "user-" + System.nanoTime(),
                "email", "user" + System.nanoTime() + "@example.com",
                "password", "secret"
        ));

        String userResponse = mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(userResponse).get("id").asLong();
    }

    private long createPost(long userId) throws Exception {
        String postRequest = objectMapper.writeValueAsString(Map.of(
                "authorId", userId,
                "description", "Post for interactions"
        ));

        String postResponse = mockMvc.perform(post("/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(postRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.authorId").value(userId))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(postResponse).get("id").asLong();
    }

    private String createLikeRequest(long userId) throws Exception {
        return objectMapper.writeValueAsString(Map.of("userId", userId));
    }

    private String createCommentRequest(long authorId, String text) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "authorId", authorId,
                "text", text
        ));
    }
}
