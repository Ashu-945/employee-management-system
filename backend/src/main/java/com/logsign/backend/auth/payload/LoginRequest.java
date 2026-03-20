package com.logsign.backend.auth.payload;

public record LoginRequest(
        String email,
        String password
) {
}
