package com.logsign.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.logsign.backend.models.Employee;
import com.logsign.backend.models.EmploymentStatus;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Boolean existsByEmailIgnoreCase(String email);

    Boolean existsByEmployeeCodeIgnoreCase(String employeeCode);

    Boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    Boolean existsByEmployeeCodeIgnoreCaseAndIdNot(String employeeCode, Long id);

    long countByDepartmentIgnoreCase(String department);

    @Query("""
            SELECT e FROM Employee e
            WHERE (
                :search IS NULL OR :search = '' OR
                lower(e.firstName) LIKE lower(concat('%', :search, '%')) OR
                lower(e.lastName) LIKE lower(concat('%', :search, '%')) OR
                lower(e.email) LIKE lower(concat('%', :search, '%')) OR
                lower(e.employeeCode) LIKE lower(concat('%', :search, '%')) OR
                lower(e.department) LIKE lower(concat('%', :search, '%')) OR
                lower(e.designation) LIKE lower(concat('%', :search, '%'))
            )
            AND (:department IS NULL OR :department = '' OR lower(e.department) = lower(:department))
            AND (:designation IS NULL OR :designation = '' OR lower(e.designation) = lower(:designation))
            AND (:status IS NULL OR e.status = :status)
            """)
    Page<Employee> search(@Param("search") String search, @Param("department") String department,
            @Param("designation") String designation, @Param("status") EmploymentStatus status, Pageable pageable);
}
