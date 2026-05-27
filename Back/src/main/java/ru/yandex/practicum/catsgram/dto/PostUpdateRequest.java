package ru.yandex.practicum.catsgram.dto;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostUpdateRequest {
    @NotNull
    private Long id;
    @Size(min = 1, max = 1000, message = "Описание должно быть от 1 до 1000 символов")
    private String description;
}
