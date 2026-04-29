package ru.yandex.practicum.catsgram.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.yandex.practicum.catsgram.dao.CommentRepository;
import ru.yandex.practicum.catsgram.dto.CommentCreateRequest;
import ru.yandex.practicum.catsgram.dto.CommentDto;
import ru.yandex.practicum.catsgram.entity.CommentEntity;
import ru.yandex.practicum.catsgram.entity.PostEntity;
import ru.yandex.practicum.catsgram.entity.UserEntity;
import ru.yandex.practicum.catsgram.exception.ConditionsNotMetException;
import ru.yandex.practicum.catsgram.mapper.CommentMapper;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostService postService;
    private final UserService userService;

    @Transactional
    public CommentDto addComment(long postId, CommentCreateRequest request) {
        if (request.getText() == null || request.getText().isBlank()) {
            throw new ConditionsNotMetException("Текст комментария не может быть пустым");
        }

        PostEntity post = postService.getEntityById(postId);
        UserEntity author = userService.getEntityById(request.getAuthorId());

        CommentEntity comment = new CommentEntity();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setText(request.getText());
        comment.setCreatedAt(Instant.now());

        return CommentMapper.toDto(commentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getPostComments(long postId) {
        postService.getEntityById(postId);
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId).stream()
                .map(CommentMapper::toDto)
                .toList();
    }
}
