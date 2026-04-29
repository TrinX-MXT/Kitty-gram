package ru.yandex.practicum.catsgram.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.yandex.practicum.catsgram.dao.LikeRepository;
import ru.yandex.practicum.catsgram.dto.LikeDto;
import ru.yandex.practicum.catsgram.entity.LikeEntity;
import ru.yandex.practicum.catsgram.entity.PostEntity;
import ru.yandex.practicum.catsgram.entity.UserEntity;
import ru.yandex.practicum.catsgram.exception.DuplicatedDataException;
import ru.yandex.practicum.catsgram.exception.NotFoundException;
import ru.yandex.practicum.catsgram.mapper.LikeMapper;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final PostService postService;
    private final UserService userService;

    @Transactional
    public LikeDto addLike(long postId, long userId) {
        PostEntity post = postService.getEntityById(postId);
        UserEntity user = userService.getEntityById(userId);

        LikeEntity like = new LikeEntity();
        like.setPost(post);
        like.setUser(user);
        like.setCreatedAt(Instant.now());

        try {
            return LikeMapper.toDto(likeRepository.save(like));
        } catch (DataIntegrityViolationException e) {
            throw new DuplicatedDataException("Лайк уже поставлен");
        }
    }

    @Transactional(readOnly = true)
    public List<LikeDto> findPostLikes(long postId) {
        postService.getEntityById(postId);
        return likeRepository.findByPostId(postId).stream().map(LikeMapper::toDto).toList();
    }

    @Transactional
    public void removeLike(long postId, long userId) {
        if (likeRepository.deleteByPostIdAndUserId(postId, userId) == 0) {
            throw new NotFoundException("Лайк не найден");
        }
    }
}
