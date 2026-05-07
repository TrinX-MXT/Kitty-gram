package ru.yandex.practicum.catsgram.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.yandex.practicum.catsgram.entity.ImageEntity;

import java.util.List;

public interface ImageRepository extends JpaRepository<ImageEntity, Long> {
    List<ImageEntity> findByPostId(Long postId);
}
