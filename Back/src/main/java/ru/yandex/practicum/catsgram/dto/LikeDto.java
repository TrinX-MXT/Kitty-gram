package ru.yandex.practicum.catsgram.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class LikeDto {
    Long id;
    Long postId;
    Long userId;
    Instant createdAt;
}
