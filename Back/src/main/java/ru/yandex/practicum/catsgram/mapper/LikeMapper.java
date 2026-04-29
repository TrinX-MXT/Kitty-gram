package ru.yandex.practicum.catsgram.mapper;

import ru.yandex.practicum.catsgram.dto.LikeDto;
import ru.yandex.practicum.catsgram.entity.LikeEntity;

public final class LikeMapper {
    private LikeMapper() {
    }

    public static LikeDto toDto(LikeEntity entity) {
        return LikeDto.builder()
                .id(entity.getId())
                .postId(entity.getPost().getId())
                .userId(entity.getUser().getId())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
