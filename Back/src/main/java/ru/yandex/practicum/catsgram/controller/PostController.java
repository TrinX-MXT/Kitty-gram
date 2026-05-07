package ru.yandex.practicum.catsgram.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.yandex.practicum.catsgram.dto.ImageDto;
import ru.yandex.practicum.catsgram.dto.PostCreateRequest;
import ru.yandex.practicum.catsgram.dto.PostDto;
import ru.yandex.practicum.catsgram.dto.PostUpdateRequest;
import ru.yandex.practicum.catsgram.exception.ParameterNotValidException;
import ru.yandex.practicum.catsgram.service.ImageService;
import ru.yandex.practicum.catsgram.service.PostService;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final ImageService imageService;

    @GetMapping
    public List<PostDto> findAll(@RequestParam(defaultValue = "0") int from,
                                 @RequestParam(defaultValue = "10") int size,
                                 @RequestParam(defaultValue = "desc") String sort
    ) {
        if (from < 0) {
            throw new ParameterNotValidException("from", "from не может быть меньше нуля");
        }
        if (size <= 0) {
            throw new ParameterNotValidException("size", "Размер должен быть больше нуля");
        }
        if (!sort.equalsIgnoreCase("asc") && !sort.equalsIgnoreCase("desc")) {
            throw new ParameterNotValidException("sort", "sort должен быть asc или desc");
        }
        return postService.findAll(from, size, sort);
    }

    @GetMapping("/{postId}")
    public PostDto findById(@PathVariable long postId) {
        return postService.findById(postId);
    }

    @GetMapping("/{postId}/images")
    public List<ImageDto> getPostImages(@PathVariable long postId) {
        postService.findById(postId);
        return imageService.getPostImages(postId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostDto create(@Valid @RequestBody PostCreateRequest post) {
        return postService.create(post);
    }

    @PutMapping
    public PostDto update(@Valid @RequestBody PostUpdateRequest newPost) {
        return postService.update(newPost);
    }
}
