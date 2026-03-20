package com.logsign.backend.auth.payload;

public record RefreshTokenRequest(
        String refreshToken
) {
}
