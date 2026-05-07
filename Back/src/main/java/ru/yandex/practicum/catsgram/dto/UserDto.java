package ru.yandex.practicum.catsgram.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class UserDto {
    Long id;
    String username;
    String email;
    Instant registrationDate;
}
