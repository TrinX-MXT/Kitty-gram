package ru.yandex.practicum.catsgram.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import ru.yandex.practicum.catsgram.dao.ImageRepository;
import ru.yandex.practicum.catsgram.dto.ImageDto;
import ru.yandex.practicum.catsgram.entity.ImageEntity;
import ru.yandex.practicum.catsgram.entity.PostEntity;
import ru.yandex.practicum.catsgram.exception.ImageFileException;
import ru.yandex.practicum.catsgram.exception.NotFoundException;
import ru.yandex.practicum.catsgram.mapper.ImageMapper;
import ru.yandex.practicum.catsgram.model.ImageData;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final PostService postService;
    private final ImageRepository imageRepository;

    @Value("${app.image-directory:./images}")
    private String imageDirectory;

    public List<ImageDto> saveImages(long postId, List<MultipartFile> files) {
        return files.stream().map(file -> saveImage(postId, file)).toList();
    }

    private ImageDto saveImage(long postId, MultipartFile file) {
        PostEntity post = postService.getEntityById(postId);
        Path filePath = saveFile(file, post);

        ImageEntity image = new ImageEntity();
        image.setPost(post);
        image.setFilePath(filePath.toString());
        image.setOriginalFileName(file.getOriginalFilename());

        return ImageMapper.toDto(imageRepository.save(image));
    }

    private Path saveFile(MultipartFile file, PostEntity post) {
        try {
            String uniqueFileName = String.format("%d.%s", Instant.now().toEpochMilli(),
                    StringUtils.getFilenameExtension(file.getOriginalFilename()));

            Path uploadPath = Paths.get(imageDirectory, String.valueOf(post.getAuthor().getId()), post.getId().toString());
            Path filePath = uploadPath.resolve(uniqueFileName);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            file.transferTo(filePath);
            return filePath;
        } catch (IOException e) {
            throw new ImageFileException("Ошибка сохранения файла", e);
        }
    }

    public ImageData getImageData(long imageId) {
        ImageEntity image = imageRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("Изображение с id = " + imageId + " не найдено"));

        byte[] data = loadFile(image);
        return new ImageData(data, image.getOriginalFileName());
    }

    public List<ImageDto> getPostImages(long postId) {
        return imageRepository.findByPostId(postId).stream().map(ImageMapper::toDto).toList();
    }

    private byte[] loadFile(ImageEntity image) {
        Path path = Paths.get(image.getFilePath());
        if (Files.exists(path)) {
            try {
                return Files.readAllBytes(path);
            } catch (IOException e) {
                throw new ImageFileException("Ошибка чтения файла. Id: " + image.getId(), e);
            }
        }
        throw new ImageFileException("Файл не найден. Id: " + image.getId());
    }
}
