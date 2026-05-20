package ru.yandex.practicum.catsgram.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.yandex.practicum.catsgram.entity.LikeEntity;

import java.util.List;

public interface LikeRepository extends JpaRepository<LikeEntity, Long> {
    List<LikeEntity> findByPostId(Long postId);
    long deleteByPostIdAndUserId(Long postId, Long userId);
    long deleteByPostId(Long postId);
    long deleteByUserId(Long userId);
}
