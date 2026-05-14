package ru.yandex.practicum.catsgram.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.yandex.practicum.catsgram.dto.LikeCreateRequest;
import ru.yandex.practicum.catsgram.dto.LikeDto;
import ru.yandex.practicum.catsgram.service.LikeService;

import java.util.List;

@RestController
@RequestMapping("/posts/{postId}/likes")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        allowCredentials = "true"
)
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LikeDto addLike(@PathVariable long postId, @Valid @RequestBody LikeCreateRequest request) {
        return likeService.addLike(postId, request.getUserId());
    }

    @GetMapping
    public List<LikeDto> getPostLikes(@PathVariable long postId) {
        return likeService.findPostLikes(postId);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeLike(@PathVariable long postId, @PathVariable long userId) {
        likeService.removeLike(postId, userId);
    }
}
