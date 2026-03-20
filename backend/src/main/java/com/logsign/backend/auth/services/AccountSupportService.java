package com.logsign.backend.auth.services;

public interface AccountSupportService {
    String createPasswordResetToken(String email);

    void resetPassword(String token, String newPassword);

    String verifyEmail(String token);
}
