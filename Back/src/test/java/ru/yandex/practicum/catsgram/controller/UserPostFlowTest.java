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
class UserPostFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateUserAndPostAndReturnUserPosts() throws Exception {
        String userRequest = objectMapper.writeValueAsString(Map.of(
                "username", "tom",
                "email", "tom@example.com",
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

        Long userId = objectMapper.readTree(userResponse).get("id").asLong();

        String postRequest = objectMapper.writeValueAsString(Map.of(
                "authorId", userId,
                "description", "My first post"
        ));

        mockMvc.perform(post("/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(postRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.authorId").value(userId));

        mockMvc.perform(get("/users/{userId}/posts", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value("My first post"));
    }

    @Test
    void shouldReturnBadRequestForInvalidPagination() throws Exception {
        mockMvc.perform(get("/posts").param("from", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }
}
