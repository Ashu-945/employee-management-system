package com.logsign.backend.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logsign.backend.models.Department;
import com.logsign.backend.payload.request.DepartmentRequest;
import com.logsign.backend.payload.response.DepartmentResponse;
import com.logsign.backend.repository.DepartmentRepository;
import com.logsign.backend.repository.EmployeeRepository;

@Service
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DepartmentService(DepartmentRepository departmentRepository, EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found with id: " + id));
        return toResponse(department);
    }

    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Department already exists");
        }

        Department department = new Department();
        apply(department, request);
        return toResponse(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found with id: " + id));

        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException("Department already exists");
        }

        apply(department, request);
        return toResponse(departmentRepository.save(department));
    }

    @Transactional
    public void delete(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found with id: " + id));
        departmentRepository.delete(department);
    }

    private void apply(Department department, DepartmentRequest request) {
        department.setName(request.getName().trim());
        department.setDescription(request.getDescription() == null ? null : request.getDescription().trim());
        department.setManagerEmployeeId(request.getManagerEmployeeId());
        department.setActive(request.isActive());
    }

    private DepartmentResponse toResponse(Department department) {
        DepartmentResponse response = new DepartmentResponse();
        response.setId(department.getId());
        response.setName(department.getName());
        response.setDescription(department.getDescription());
        response.setManagerEmployeeId(department.getManagerEmployeeId());
        response.setActive(department.isActive());
        response.setEmployeeCount(employeeRepository.countByDepartmentIgnoreCase(department.getName()));
        return response;
    }
}
