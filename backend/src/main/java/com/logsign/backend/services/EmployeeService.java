package com.logsign.backend.services;

import java.util.Locale;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logsign.backend.models.Employee;
import com.logsign.backend.models.EmploymentStatus;
import com.logsign.backend.payload.request.EmployeeRequest;
import com.logsign.backend.payload.response.EmployeeResponse;
import com.logsign.backend.payload.response.PagedResponse;
import com.logsign.backend.repository.EmployeeRepository;

@Service
public class EmployeeService {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "employeeCode",
            "firstName",
            "lastName",
            "email",
            "department",
            "designation",
            "status",
            "dateOfJoining",
            "createdAt");

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        validateUniqueness(request.getEmployeeCode(), request.getEmail(), null);

        Employee employee = new Employee();
        applyRequest(employee, request);
        return mapToResponse(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));

        validateUniqueness(request.getEmployeeCode(), request.getEmail(), id);
        applyRequest(employee, request);
        return mapToResponse(employeeRepository.save(employee));
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));
        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> getEmployees(String search, int page, int size, String sortBy, String sortDir) {
        return getEmployees(search, null, null, null, page, size, sortBy, sortDir);
    }

    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> getEmployees(String search, String department, String designation, EmploymentStatus status,
            int page, int size, String sortBy, String sortDir) {
        String safeSortBy = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "id";
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Sort sort = Sort.by("desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC, safeSortBy);
        Pageable pageable = PageRequest.of(safePage, safeSize, sort);
        Page<Employee> employeePage = employeeRepository.search(
                search == null ? "" : search.trim().toLowerCase(Locale.ROOT),
                department == null ? "" : department.trim(),
                designation == null ? "" : designation.trim(),
                status,
                pageable);

        return new PagedResponse<>(
                employeePage.getContent().stream().map(this::mapToResponse).toList(),
                employeePage.getNumber(),
                employeePage.getSize(),
                employeePage.getTotalElements(),
                employeePage.getTotalPages(),
                employeePage.isLast());
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));
        employeeRepository.delete(employee);
    }

    @Transactional
    public EmployeeResponse updateProfilePhoto(Long id, String photoUrl) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));
        employee.setProfilePhotoUrl(photoUrl);
        return mapToResponse(employeeRepository.save(employee));
    }

    private void applyRequest(Employee employee, EmployeeRequest request) {
        employee.setEmployeeCode(request.getEmployeeCode().trim());
        employee.setFirstName(request.getFirstName().trim());
        employee.setLastName(request.getLastName().trim());
        employee.setEmail(request.getEmail().trim().toLowerCase(Locale.ROOT));
        employee.setPhone(request.getPhone().trim());
        employee.setDepartment(request.getDepartment().trim());
        employee.setDesignation(request.getDesignation().trim());
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setAddress(request.getAddress());
        employee.setProfilePhotoUrl(request.getProfilePhotoUrl());
        employee.setDateOfJoining(request.getDateOfJoining());
        employee.setSalary(request.getSalary());
        employee.setStatus(request.getStatus());
    }

    private void validateUniqueness(String employeeCode, String email, Long currentEmployeeId) {
        boolean codeExists = currentEmployeeId == null
                ? employeeRepository.existsByEmployeeCodeIgnoreCase(employeeCode)
                : employeeRepository.existsByEmployeeCodeIgnoreCaseAndIdNot(employeeCode, currentEmployeeId);
        if (codeExists) {
            throw new IllegalArgumentException("Employee code is already in use");
        }

        boolean emailExists = currentEmployeeId == null
                ? employeeRepository.existsByEmailIgnoreCase(email)
                : employeeRepository.existsByEmailIgnoreCaseAndIdNot(email, currentEmployeeId);
        if (emailExists) {
            throw new IllegalArgumentException("Employee email is already in use");
        }
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        EmployeeResponse response = new EmployeeResponse();
        response.setId(employee.getId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setFirstName(employee.getFirstName());
        response.setLastName(employee.getLastName());
        response.setEmail(employee.getEmail());
        response.setPhone(employee.getPhone());
        response.setDepartment(employee.getDepartment());
        response.setDesignation(employee.getDesignation());
        response.setDateOfBirth(employee.getDateOfBirth());
        response.setAddress(employee.getAddress());
        response.setProfilePhotoUrl(employee.getProfilePhotoUrl());
        response.setDateOfJoining(employee.getDateOfJoining());
        response.setSalary(employee.getSalary());
        response.setStatus(employee.getStatus());
        response.setCreatedAt(employee.getCreatedAt());
        response.setUpdatedAt(employee.getUpdatedAt());
        return response;
    }
}
