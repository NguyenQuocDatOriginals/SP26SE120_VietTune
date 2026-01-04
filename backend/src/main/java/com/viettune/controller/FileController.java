package com.viettune.controller;

import com.viettune.dto.response.MessageResponse;
import com.viettune.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload/audio")
    public ResponseEntity<?> uploadAudio(@RequestParam("file") MultipartFile file) {
        try {
            String filePath = fileStorageService.storeAudioFile(file);
            Map<String, String> response = new HashMap<>();
            response.put("filePath", filePath);
            response.put("message", "Audio file uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(MessageResponse.builder()
                    .message("Failed to upload audio file: " + e.getMessage())
                    .success(false)
                    .build());
        }
    }

    @PostMapping("/upload/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String filePath = fileStorageService.storeImageFile(file);
            Map<String, String> response = new HashMap<>();
            response.put("filePath", filePath);
            response.put("message", "Image file uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(MessageResponse.builder()
                    .message("Failed to upload image file: " + e.getMessage())
                    .success(false)
                    .build());
        }
    }

    @DeleteMapping("/{filePath}")
    public ResponseEntity<MessageResponse> deleteFile(@PathVariable String filePath) {
        try {
            fileStorageService.deleteFile(filePath);
            return ResponseEntity.ok(MessageResponse.builder()
                    .message("File deleted successfully")
                    .success(true)
                    .build());
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(MessageResponse.builder()
                    .message("Failed to delete file: " + e.getMessage())
                    .success(false)
                    .build());
        }
    }
}
