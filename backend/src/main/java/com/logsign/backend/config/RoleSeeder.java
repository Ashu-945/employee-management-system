package com.logsign.backend.config;

import java.util.EnumSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.logsign.backend.models.EPermission;
import com.logsign.backend.models.ERole;
import com.logsign.backend.models.Permission;
import com.logsign.backend.repository.PermissionRepository;
import com.logsign.backend.auth.entities.Role;
import com.logsign.backend.auth.entities.User;
import com.logsign.backend.auth.repositories.RoleRepository;
import com.logsign.backend.auth.repositories.UserRepository;

@Configuration
public class RoleSeeder {

    @Value("${app.bootstrap.admin.username:admin}")
    private String adminUsername;

    @Value("${app.bootstrap.admin.email:admin@company.com}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password:Admin@123}")
    private String adminPassword;

    @Bean
    CommandLineRunner seedRoles(RoleRepository roleRepository, PermissionRepository permissionRepository,
            UserRepository userRepository, PasswordEncoder encoder) {
        return args -> {
            seedPermissions(permissionRepository);

            Role userRole = createIfMissing(roleRepository, ERole.ROLE_USER);
            Role moderatorRole = createIfMissing(roleRepository, ERole.ROLE_MODERATOR);
            Role adminRole = createIfMissing(roleRepository, ERole.ROLE_ADMIN);

            setPermissions(roleRepository, userRole, permissionRepository,
                    Set.of(EPermission.EMPLOYEE_READ, EPermission.SELF_READ));
            setPermissions(roleRepository, moderatorRole, permissionRepository, Set.of(
                    EPermission.EMPLOYEE_READ,
                    EPermission.EMPLOYEE_WRITE,
                    EPermission.DEPARTMENT_READ,
                    EPermission.DEPARTMENT_WRITE));
            setPermissions(roleRepository, adminRole, permissionRepository, EnumSet.allOf(EPermission.class));

            bootstrapAdmin(userRepository, encoder, adminRole);
            bootstrapFallbackUser(userRepository, encoder, userRole);
        };
    }

    private void seedPermissions(PermissionRepository permissionRepository) {
        for (EPermission permission : EPermission.values()) {
            permissionRepository.findByName(permission)
                    .orElseGet(() -> permissionRepository.save(new Permission(permission)));
        }
    }

    private Role createIfMissing(RoleRepository roleRepository, ERole roleName) {
        return roleRepository.findByName(roleName.name())
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    private void setPermissions(RoleRepository roleRepository, Role role, PermissionRepository permissionRepository,
            Set<EPermission> permissions) {
        Set<Permission> resolved = permissions.stream()
                .map(permission -> permissionRepository.findByName(permission)
                        .orElseThrow(() -> new IllegalStateException("Permission missing: " + permission)))
                .collect(java.util.stream.Collectors.toSet());
        role.setPermissions(resolved);
        roleRepository.save(role);
    }

    private void bootstrapAdmin(UserRepository userRepository, PasswordEncoder encoder, Role adminRole) {
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin == null) {
            admin = new User("Admin User", adminEmail, encoder.encode(adminPassword));
        }
        admin.setEmail(adminEmail);
        admin.setPassword(encoder.encode(adminPassword));
        admin.setRoles(Set.of(adminRole));
        admin.setEnable(true);
        userRepository.save(admin);
    }

    private void bootstrapFallbackUser(UserRepository userRepository, PasswordEncoder encoder, Role employeeRole) {
        String defaultEmail = "employee.user@company.com";
        if (userRepository.existsByEmail(defaultEmail)) {
            return;
        }

        User user = new User("Employee User", defaultEmail, encoder.encode("User@123"));
        user.setRoles(Set.of(employeeRole));
        user.setEnable(true);
        userRepository.save(user);
    }
}
