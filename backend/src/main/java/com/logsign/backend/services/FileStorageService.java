package com.logsign.backend.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {
    private final Path root = Paths.get("uploads/profile-photos");

    public String storeProfilePhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Profile photo file is required");
        }

        try {
            Files.createDirectories(root);
            String originalName = file.getOriginalFilename() == null ? "photo" : file.getOriginalFilename();
            String extension = "";
            int idx = originalName.lastIndexOf('.');
            if (idx >= 0) {
                extension = originalName.substring(idx);
            }
            String filename = UUID.randomUUID() + extension;
            Path destination = root.resolve(filename);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/profile-photos/" + filename;
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to store profile photo", ex);
        }
    }
}
