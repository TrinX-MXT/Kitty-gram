package ru.yandex.practicum.catsgram.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.yandex.practicum.catsgram.entity.CommentEntity;

import java.util.List;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    List<CommentEntity> findByPostIdOrderByCreatedAtDesc(Long postId);
    long deleteByPostId(Long postId);
    long deleteByAuthorId(Long authorId);
}
