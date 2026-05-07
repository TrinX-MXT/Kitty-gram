package ru.yandex.practicum.catsgram.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.yandex.practicum.catsgram.dao.PostRepository;
import ru.yandex.practicum.catsgram.dto.PostCreateRequest;
import ru.yandex.practicum.catsgram.dto.PostDto;
import ru.yandex.practicum.catsgram.dto.PostUpdateRequest;
import ru.yandex.practicum.catsgram.entity.PostEntity;
import ru.yandex.practicum.catsgram.entity.UserEntity;
import ru.yandex.practicum.catsgram.exception.ConditionsNotMetException;
import ru.yandex.practicum.catsgram.exception.NotFoundException;
import ru.yandex.practicum.catsgram.mapper.PostMapper;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<PostDto> findAll(int from, int size, String sort) {
        if (size <= 0) {
            throw new ConditionsNotMetException("size должен быть больше 0");
        }
        if (from < 0) {
            throw new ConditionsNotMetException("from не может быть меньше 0");
        }

        Sort.Direction direction = switch (sort.toLowerCase()) {
            case "asc" -> Sort.Direction.ASC;
            case "desc" -> Sort.Direction.DESC;
            default -> throw new ConditionsNotMetException("sort должен быть asc или desc");
        };

        int page = from / size;
        int offsetInPage = from % size;

        return postRepository.findAll(PageRequest.of(page, size + offsetInPage, Sort.by(direction, "postDate")))
                .getContent()
                .stream()
                .skip(offsetInPage)
                .limit(size)
                .map(PostMapper::toDto)
                .toList();
    }

    @Transactional
    public PostDto create(PostCreateRequest request) {
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new ConditionsNotMetException("Описание не может быть пустым");
        }

        UserEntity author = userService.getEntityById(request.getAuthorId());

        PostEntity entity = new PostEntity();
        entity.setAuthor(author);
        entity.setDescription(request.getDescription());
        entity.setPostDate(Instant.now());

        return PostMapper.toDto(postRepository.save(entity));
    }

    @Transactional
    public PostDto update(PostUpdateRequest request) {
        PostEntity existingPost = postRepository.findById(request.getId())
                .orElseThrow(() -> new NotFoundException("Пост с id = " + request.getId() + " не найден"));

        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new ConditionsNotMetException("Описание не может быть пустым");
        }

        existingPost.setDescription(request.getDescription());
        return PostMapper.toDto(postRepository.save(existingPost));
    }

    @Transactional(readOnly = true)
    public PostDto findById(long postId) {
        return postRepository.findById(postId)
                .map(PostMapper::toDto)
                .orElseThrow(() -> new NotFoundException("Пост с id = " + postId + " не найден"));
    }

    @Transactional(readOnly = true)
    public PostEntity getEntityById(long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Пост с id = " + postId + " не найден"));
    }

    @Transactional(readOnly = true)
    public List<PostDto> findByAuthorId(long authorId) {
        return postRepository.findByAuthorId(authorId).stream().map(PostMapper::toDto).toList();
    }
}
