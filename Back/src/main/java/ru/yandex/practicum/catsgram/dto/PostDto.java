package ru.yandex.practicum.catsgram.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class PostDto {
    Long id;
    Long authorId;
    String description;
    Instant postDate;
}
