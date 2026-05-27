package ru.yandex.practicum.catsgram.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    @NotNull
    private Long id;
    private String email;
    private String password;
}
