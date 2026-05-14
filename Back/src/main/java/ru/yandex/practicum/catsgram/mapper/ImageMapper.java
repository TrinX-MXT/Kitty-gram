package ru.yandex.practicum.catsgram.mapper;

import ru.yandex.practicum.catsgram.dto.ImageDto;
import ru.yandex.practicum.catsgram.entity.ImageEntity;

public final class ImageMapper {
    private ImageMapper() {
    }

    public static ImageDto toDto(ImageEntity entity) {
        return ImageDto.builder()
                .id(entity.getId())
                .postId(entity.getPost().getId())
                .originalFileName(entity.getOriginalFileName())
                .build();
    }
}
