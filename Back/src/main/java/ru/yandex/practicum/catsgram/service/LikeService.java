package ru.yandex.practicum.catsgram.service;

import lombok.RequiredArgsConstructor;
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

        if (likeRepository.existsByPostIdAndUserId(postId, userId)) {
            throw new DuplicatedDataException("Лайк уже поставлен");
        }

        LikeEntity like = new LikeEntity();
        like.setPost(post);
        like.setUser(user);
        like.setCreatedAt(Instant.now());

        return LikeMapper.toDto(likeRepository.save(like));
    }

    @Transactional(readOnly = true)
    public List<LikeDto> findPostLikes(long postId) {
        postService.getEntityById(postId);
        return likeRepository.findByPostId(postId).stream().map(LikeMapper::toDto).toList();
    }

    @Transactional
    public void removeLike(long postId, long userId) {
        if (!likeRepository.existsByPostIdAndUserId(postId, userId)) {
            throw new NotFoundException("Лайк не найден");
        }
        likeRepository.deleteByPostIdAndUserId(postId, userId);
    }
}
