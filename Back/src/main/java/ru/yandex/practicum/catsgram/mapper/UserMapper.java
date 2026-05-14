package ru.yandex.practicum.catsgram.mapper;

import ru.yandex.practicum.catsgram.dto.UserDto;
import ru.yandex.practicum.catsgram.entity.UserEntity;

public final class UserMapper {
    private UserMapper() {
    }

    public static UserDto toDto(UserEntity entity) {
        return UserDto.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .email(entity.getEmail())
                .registrationDate(entity.getRegistrationDate())
                .build();
    }
}
