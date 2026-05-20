package ru.yandex.practicum.catsgram.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.yandex.practicum.catsgram.dto.UserCreateRequest;
import ru.yandex.practicum.catsgram.security.JwtUtil;
import ru.yandex.practicum.catsgram.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(@RequestBody UserCreateRequest request) {
        log.info("Registering user {}", request.getEmail());
        var dto = userService.createUser(request);
        String token = jwtUtil.generateToken(dto.getId());
        return Map.of("user", dto, "token", token);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        log.info("Login attempt for {}", email);
        var user = userService.authenticate(email, password);
        String token = jwtUtil.generateToken(user.getId());
        return Map.of("user", user, "token", token);
    }
}
