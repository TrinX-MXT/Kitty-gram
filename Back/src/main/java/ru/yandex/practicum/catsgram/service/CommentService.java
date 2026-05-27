package ru.yandex.practicum.catsgram.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.yandex.practicum.catsgram.dao.CommentRepository;
import ru.yandex.practicum.catsgram.dto.CommentCreateRequest;
import ru.yandex.practicum.catsgram.dto.CommentDto;
import ru.yandex.practicum.catsgram.entity.CommentEntity;
import ru.yandex.practicum.catsgram.entity.PostEntity;
import ru.yandex.practicum.catsgram.entity.UserEntity;
import ru.yandex.practicum.catsgram.exception.NotFoundException;
import ru.yandex.practicum.catsgram.exception.UnauthorizedException;
import ru.yandex.practicum.catsgram.mapper.CommentMapper;
import ru.yandex.practicum.catsgram.security.SecurityUtils;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor  // ← Lombok создаст конструктор автоматически
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostService postService;
    private final UserService userService;
    private final JdbcTemplate jdbcTemplate; // primary (master)
    private final JdbcTemplate slaveJdbcTemplate; // for reads

    public CommentService(CommentRepository commentRepository, PostService postService, UserService userService,
                          JdbcTemplate jdbcTemplate, @Qualifier("slaveJdbcTemplate") JdbcTemplate slaveJdbcTemplate) {
        this.commentRepository = commentRepository;
        this.postService = postService;
        this.userService = userService;
        this.jdbcTemplate = jdbcTemplate;
        this.slaveJdbcTemplate = slaveJdbcTemplate;
    }

    // Primary JdbcTemplate (для записи)
    private final JdbcTemplate jdbcTemplate;

    // Slave JdbcTemplate (для чтения) — @Qualifier на поле!
    @Qualifier("slaveJdbcTemplate")
    private final JdbcTemplate slaveJdbcTemplate;

    // ❌ УДАЛИ РУЧНОЙ КОНСТРУКТОР (он был ниже) — Lombok сделает сам!

    @Transactional
    public CommentDto addComment(long postId, CommentCreateRequest request) {
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
        // read from slave
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId).stream()
                .map(CommentMapper::toDto)
                .toList();
    }

    @Transactional
    public void deleteComment(long postId, long commentId) {
        // verify comment exists and belongs to post
        Long authorId = null;
        try {
            authorId = slaveJdbcTemplate.queryForObject(
                    "select author_id from comments where id = ? and post_id = ?",
                    Long.class, commentId, postId);
        } catch (Exception e) {
            throw new NotFoundException("Комментарий не найден");
        }

        Long currentUser = SecurityUtils.getCurrentUserId();
        if (currentUser == null) {
            throw new UnauthorizedException("Требуется авторизация");
        }

        // allow comment author or post author to delete
        var post = postService.getEntityById(postId);
        if (!currentUser.equals(authorId) && !currentUser.equals(post.getAuthor().getId())) {
            throw new UnauthorizedException("Нет прав для удаления комментария");
        }

        log.info("Deleting comment {} from post {} by user {}", commentId, postId, currentUser);
        int deleted = jdbcTemplate.update("delete from comments where id = ?", commentId);
        if (deleted == 0) throw new NotFoundException("Комментарий не найден");
    }
}
