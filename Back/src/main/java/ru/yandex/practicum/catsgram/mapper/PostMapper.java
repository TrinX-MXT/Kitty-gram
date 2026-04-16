package ru.yandex.practicum.catsgram.mapper;

import ru.yandex.practicum.catsgram.dto.PostDto;
import ru.yandex.practicum.catsgram.entity.PostEntity;

public final class PostMapper {
    private PostMapper() {
    }

    public static PostDto toDto(PostEntity entity) {
        return PostDto.builder()
                .id(entity.getId())
                .authorId(entity.getAuthor().getId())
                .description(entity.getDescription())
                .postDate(entity.getPostDate())
                .build();
    }
}
