package com.viettune.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.upload.audio-dir}")
    private String audioDir;

    @Value("${app.upload.image-dir}")
    private String imageDir;

    public String storeAudioFile(MultipartFile file) throws IOException {
        return storeFile(file, audioDir);
    }

    public String storeImageFile(MultipartFile file) throws IOException {
        return storeFile(file, imageDir);
    }

    private String storeFile(MultipartFile file, String directory) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file");
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";

        String filename = UUID.randomUUID().toString() + fileExtension;
        Path uploadPath = Path.of(uploadDir, directory);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return directory + "/" + filename;
    }

    public void deleteFile(String filePath) throws IOException {
        Path path = Path.of(uploadDir, filePath);
        Files.deleteIfExists(path);
    }
}
