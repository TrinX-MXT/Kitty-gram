package ru.yandex.practicum.catsgram.mapper;

import ru.yandex.practicum.catsgram.dto.CommentDto;
import ru.yandex.practicum.catsgram.entity.CommentEntity;

public final class CommentMapper {
    private CommentMapper() {
    }

    public static CommentDto toDto(CommentEntity entity) {
        return CommentDto.builder()
                .id(entity.getId())
                .postId(entity.getPost().getId())
                .authorId(entity.getAuthor().getId())
                .text(entity.getText())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
