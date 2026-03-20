package com.logsign.backend.auth.services.impl;

import com.logsign.backend.auth.entities.User;
import com.logsign.backend.auth.repositories.UserRepository;
import com.logsign.backend.auth.services.AccountSupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class InMemoryAccountSupportService implements AccountSupportService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.auth.require-email-verification:false}")
    private boolean requireEmailVerification;

    private final Map<String, TokenRecord> passwordResetTokens = new ConcurrentHashMap<>();

    @Override
    public String createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No user found with the given email"));

        String token = UUID.randomUUID().toString();
        passwordResetTokens.put(token, new TokenRecord(user.getEmail(), Instant.now().plusSeconds(15 * 60)));
        return token;
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        TokenRecord tokenRecord = passwordResetTokens.remove(token);
        if (tokenRecord == null || tokenRecord.expiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Reset token is invalid or expired");
        }

        User user = userRepository.findByEmail(tokenRecord.email())
                .orElseThrow(() -> new IllegalArgumentException("No user found for the supplied reset token"));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    @Override
    public String verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Verification token is required");
        }
        if (!requireEmailVerification) {
            return "Email verification is not required for this application. You can sign in directly.";
        }
        return "Email verification endpoint is enabled, but token issuance is not configured yet.";
    }

    private record TokenRecord(String email, Instant expiresAt) {
    }
}
