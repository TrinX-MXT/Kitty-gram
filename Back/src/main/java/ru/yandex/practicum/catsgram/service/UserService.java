package ru.yandex.practicum.catsgram.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.yandex.practicum.catsgram.dao.UserRepository;
import ru.yandex.practicum.catsgram.dto.UserCreateRequest;
import ru.yandex.practicum.catsgram.dto.UserDto;
import ru.yandex.practicum.catsgram.dto.UserUpdateRequest;
import ru.yandex.practicum.catsgram.entity.UserEntity;
import ru.yandex.practicum.catsgram.exception.ConditionsNotMetException;
import ru.yandex.practicum.catsgram.exception.DuplicatedDataException;
import ru.yandex.practicum.catsgram.exception.NotFoundException;
import ru.yandex.practicum.catsgram.mapper.UserMapper;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(UserMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public UserDto findById(long id) {
        return userRepository.findById(id)
                .map(UserMapper::toDto)
                .orElseThrow(() -> new NotFoundException("Пользователь с id = " + id + " не найден"));
    }

    @Transactional
    public UserDto createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicatedDataException("Этот имейл уже используется");
        }

        UserEntity entity = new UserEntity();
        entity.setUsername(request.getUsername());
        entity.setEmail(request.getEmail());
        entity.setPassword(request.getPassword());
        entity.setRegistrationDate(Instant.now());

        return UserMapper.toDto(userRepository.save(entity));
    }

    @Transactional
    public UserDto updateUser(UserUpdateRequest request) {
        UserEntity existingUser = userRepository.findById(request.getId())
                .orElseThrow(() -> new NotFoundException("Пользователь с таким id не найден"));

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(existingUser.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicatedDataException("Этот имейл уже используется");
            }
            existingUser.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            existingUser.setPassword(request.getPassword());
        }

        if (request.getEmail() == null && request.getPassword() == null) {
            throw new ConditionsNotMetException("Для обновления нужно передать email или password");
        }

        return UserMapper.toDto(userRepository.save(existingUser));
    }

    @Transactional(readOnly = true)
    public UserEntity getEntityById(long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Пользователь с id = " + id + " не найден"));
    }
}
