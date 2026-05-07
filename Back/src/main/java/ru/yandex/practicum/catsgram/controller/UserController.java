package ru.yandex.practicum.catsgram.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.yandex.practicum.catsgram.dto.PostDto;
import ru.yandex.practicum.catsgram.dto.UserCreateRequest;
import ru.yandex.practicum.catsgram.dto.UserDto;
import ru.yandex.practicum.catsgram.dto.UserUpdateRequest;
import ru.yandex.practicum.catsgram.service.PostService;
import ru.yandex.practicum.catsgram.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final PostService postService;

    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{userId}")
    public UserDto findById(@PathVariable long userId) {
        return userService.findById(userId);
    }

    @GetMapping("/{userId}/posts")
    public List<PostDto> getUserPosts(@PathVariable long userId) {
        userService.findById(userId);
        return postService.findByAuthorId(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createUser(@Valid @RequestBody UserCreateRequest user) {
        return userService.createUser(user);
    }

    @PutMapping
    public UserDto updateUser(@Valid @RequestBody UserUpdateRequest user) {
        return userService.updateUser(user);
    }
}
