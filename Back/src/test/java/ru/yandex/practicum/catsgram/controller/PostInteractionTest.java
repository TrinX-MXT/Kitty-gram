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
    void shouldCreateLikeAndReturnLikes() throws Exception {
        long userId = createUser();
        long postId = createPost(userId);

        String likeRequest = objectMapper.writeValueAsString(Map.of("userId", userId));

        mockMvc.perform(post("/posts/{postId}/likes", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(likeRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(userId));

        mockMvc.perform(get("/posts/{postId}/likes", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(userId));

        mockMvc.perform(post("/posts/{postId}/likes", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(likeRequest))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void shouldCreateCommentAndReturnComments() throws Exception {
        long userId = createUser();
        long postId = createPost(userId);

        String commentRequest = objectMapper.writeValueAsString(Map.of(
                "authorId", userId,
                "text", "Nice post"
        ));

        mockMvc.perform(post("/posts/{postId}/comments", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(commentRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.authorId").value(userId))
                .andExpect(jsonPath("$.text").value("Nice post"));

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
}
