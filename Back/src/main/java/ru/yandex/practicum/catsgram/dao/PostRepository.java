package ru.yandex.practicum.catsgram.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.yandex.practicum.catsgram.entity.PostEntity;

import java.util.List;

public interface PostRepository extends JpaRepository<PostEntity, Long> {
    List<PostEntity> findByAuthorId(Long authorId);
}
