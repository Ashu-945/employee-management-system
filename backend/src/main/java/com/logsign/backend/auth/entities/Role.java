package com.logsign.backend.auth.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
@Entity
@Table(name = "roles")
public class Role {
    @Builder.Default
    @Id
    @jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id = UUID.randomUUID();
    @Column(unique = true, nullable = false)
    private String name;

    @Builder.Default
    @jakarta.persistence.ManyToMany(fetch = jakarta.persistence.FetchType.EAGER)
    @jakarta.persistence.JoinTable(name = "role_permissions", joinColumns = @jakarta.persistence.JoinColumn(name = "role_id"), inverseJoinColumns = @jakarta.persistence.JoinColumn(name = "permission_id"))
    private java.util.Set<com.logsign.backend.models.Permission> permissions = new java.util.HashSet<>();

    // For backwards compatibility with RoleSeeder
    public Role(String name) {
        this.name = name;
    }

    public Role(com.logsign.backend.models.ERole eRole) {
        this.name = eRole.name();
    }
}
