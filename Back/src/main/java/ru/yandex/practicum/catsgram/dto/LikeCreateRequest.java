package ru.yandex.practicum.catsgram.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LikeCreateRequest {
    @NotNull
    private Long userId;
}
