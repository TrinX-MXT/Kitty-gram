package ru.yandex.practicum.catsgram.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.yandex.practicum.catsgram.dto.CommentCreateRequest;
import ru.yandex.practicum.catsgram.dto.CommentDto;
import ru.yandex.practicum.catsgram.service.CommentService;

import java.util.List;

@RestController
@RequestMapping("/posts/{postId}/comments")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        allowCredentials = "true"
)
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommentDto addComment(@PathVariable long postId, @Valid @RequestBody CommentCreateRequest request) {
        return commentService.addComment(postId, request);
    }

    @GetMapping
    public List<CommentDto> getPostComments(@PathVariable long postId) {
        return commentService.getPostComments(postId);
    }
}
