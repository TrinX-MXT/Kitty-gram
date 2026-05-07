package ru.yandex.practicum.catsgram.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ImageDto {
    Long id;
    Long postId;
    String originalFileName;
}
