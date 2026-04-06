package ru.yandex.practicum.catsgram.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.yandex.practicum.catsgram.exception.ParameterNotValidException;
import ru.yandex.practicum.catsgram.model.Post;
import ru.yandex.practicum.catsgram.service.PostService;

import java.util.Collection;
import java.util.Optional;

@RestController
@RequestMapping("/posts")
public class PostController {
    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public Collection<Post> findAll(@RequestParam(defaultValue = "0") int from,
                                    @RequestParam(defaultValue = "10") int size,
                                    @RequestParam(defaultValue = "desc") String sort
                                    ) {

        if (from < 0) {
            throw new ParameterNotValidException("from",
                    "\"Некорректное значение параметра from. from не может быть меньше нуля\"");
        }

        if (size <= 0) {
            throw new ParameterNotValidException("size",
                    "Некорректный размер выборки. Размер должен быть больше нуля");
        }

        if (!sort.toLowerCase().equals("asc") && !sort.toLowerCase().equals("desc")) {
            throw new ParameterNotValidException("sort",
                    "Некорректный параметр сортировки. sort должен быть asc или desc");
        }
        return postService.findAll(from, size, sort);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Optional<Post>> findById(@PathVariable int postId) {
        Optional<Post> result = postService.findById(postId);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "aplication/json");

        return new ResponseEntity<>(result, headers, HttpStatus.OK);
//        return postService.findById(postId);
    }

//    @GetMapping("/posts/search")
//    public List<Post> searchPost(@RequestParam String author,
//                                 @RequestParam
//                                 @DateTimeFormat(pattern = "yyyy-MM-dd")LocalDate date) {
//        System.out.println("Ищем посты пользователя с именем " + author + " и опублиуованные " + date);
//    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Post create(@RequestBody Post post) {

//        Post createdPost = postService.create(post);
//        return ResponseEntity
//                .status(HttpStatus.CREATED)
//                .body(createdPost);

        return postService.create(post);
    }

    @PutMapping
    public Post update(@RequestBody Post newPost) {
        return postService.update(newPost);
    }
}