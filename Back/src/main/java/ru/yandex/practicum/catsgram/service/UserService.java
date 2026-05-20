package ru.yandex.practicum.catsgram.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.yandex.practicum.catsgram.dao.CommentRepository;
import ru.yandex.practicum.catsgram.dao.ImageRepository;
import ru.yandex.practicum.catsgram.dao.LikeRepository;
import ru.yandex.practicum.catsgram.dao.PostRepository;
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
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final ImageRepository imageRepository;
    private final PasswordEncoder passwordEncoder;

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
        entity.setPassword(passwordEncoder.encode(request.getPassword()));
        entity.setRegistrationDate(Instant.now());

        log.info("Creating user {}", request.getEmail());
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
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
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

    @Transactional
    public UserEntity authenticate(String email, String rawPassword) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь с таким email не найден"));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new ConditionsNotMetException("Неправильный пароль");
        }
        return user;
    }

    @Transactional
    public void deleteUser(long userId) {
        UserEntity user = getEntityById(userId);
        log.info("Deleting user {} and related data", userId);
        // delete likes created by the user (bulk)
        likeRepository.deleteByUserId(userId);

        // delete comments created by the user (bulk)
        commentRepository.deleteByAuthorId(userId);

        // delete posts by user: for each post delete children first using bulk repo methods
        var posts = postRepository.findByAuthorId(userId);
        for (var p : posts) {
            long pid = p.getId();
            imageRepository.deleteByPostId(pid);
            likeRepository.deleteByPostId(pid);
            commentRepository.deleteByPostId(pid);
            postRepository.deleteById(pid);
        }

        userRepository.deleteById(userId);
    }
}
