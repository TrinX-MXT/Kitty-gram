package ru.yandex.practicum.catsgram.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.yandex.practicum.catsgram.entity.LikeEntity;

import java.util.List;

public interface LikeRepository extends JpaRepository<LikeEntity, Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);

    List<LikeEntity> findByPostId(Long postId);

    void deleteByPostIdAndUserId(Long postId, Long userId);
}
