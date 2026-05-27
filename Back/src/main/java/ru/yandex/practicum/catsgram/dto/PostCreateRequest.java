package ru.yandex.practicum.catsgram.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostCreateRequest {
    @NotNull
    private Long authorId;
    @NotBlank
    private String description;
}
