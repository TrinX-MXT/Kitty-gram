package ru.yandex.practicum.catsgram.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostUpdateRequest {
    @NotNull
    private Long id;
    @NotBlank
    private String description;
}
