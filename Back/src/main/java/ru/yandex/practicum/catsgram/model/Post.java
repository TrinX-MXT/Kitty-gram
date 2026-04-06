package ru.yandex.practicum.catsgram.model;

import java.time.Instant;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(of = "id")

public class Post {
    private Long id;
    private String authorId;
    private String description;
    private Instant postDate;

}
