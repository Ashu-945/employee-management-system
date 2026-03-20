package com.logsign.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DepartmentRequest {
    @NotBlank
    private String name;
    private String description;
    private Long managerEmployeeId;
    @NotNull
    private boolean active;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getManagerEmployeeId() {
        return managerEmployeeId;
    }

    public void setManagerEmployeeId(Long managerEmployeeId) {
        this.managerEmployeeId = managerEmployeeId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
