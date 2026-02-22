import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    dateOfJoining: '',
    salary: '',
    status: 'ACTIVE',
};

const columns = [
    { key: 'employeeCode', label: 'Code', sortable: true },
    { key: 'firstName', label: 'Name', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'designation', label: 'Designation', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
];

const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'employees', label: 'Employees' },
    { key: 'departments', label: 'Departments' },
    { key: 'leave', label: 'Leave Management' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'payroll', label: 'Payroll' },
];

const titleBySection = {
    dashboard: 'Dashboard Overview',
    employees: 'Employee Management',
    departments: 'Department Management',
    leave: 'Leave Management',
    attendance: 'Attendance Management',
    payroll: 'Payroll Management',
};

const Dashboard = ({ adminView = false }) => {
    const formRef = useRef(null);
    const { user, logout } = useAuth();

    const [activeSection, setActiveSection] = useState('dashboard');

    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [serverSearch, setServerSearch] = useState('');
    const [page, setPage] = useState(0);
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    const [departments, setDepartments] = useState([]);
    const [deptLoading, setDeptLoading] = useState(false);

    const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, last: true });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);

    const canManage = useMemo(
        () => user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_MODERATOR'),
        [user]
    );
    const canDelete = useMemo(() => user?.roles?.includes('ROLE_ADMIN'), [user]);

    const activeCount = useMemo(() => employees.filter((employee) => employee.status === 'ACTIVE').length, [employees]);
    const onLeaveCount = useMemo(() => employees.filter((employee) => employee.status === 'ON_LEAVE').length, [employees]);
    const inactiveCount = useMemo(() => employees.filter((employee) => employee.status === 'INACTIVE').length, [employees]);

    const loadEmployees = async (searchText = serverSearch, nextPage = page, nextSortBy = sortBy, nextSortDir = sortDir) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/employees', {
                params: {
                    search: searchText,
                    page: nextPage,
                    size: 8,
                    sortBy: nextSortBy,
                    sortDir: nextSortDir,
                },
            });
            setEmployees(response.data.content || []);
            setMeta({
                totalElements: response.data.totalElements || 0,
                totalPages: response.data.totalPages || 0,
                last: response.data.last ?? true,
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        setDeptLoading(true);
        setError('');
        try {
            const response = await axios.get('/departments');
            setDepartments(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch departments');
        } finally {
            setDeptLoading(false);
        }
    };

    useEffect(() => {
        if (activeSection === 'employees' || activeSection === 'dashboard') {
            loadEmployees(serverSearch, page, sortBy, sortDir);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, sortBy, sortDir, serverSearch, activeSection]);

    useEffect(() => {
        if (activeSection === 'departments') {
            loadDepartments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSection]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            setServerSearch(search.trim());
        }, 450);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        setServerSearch(search.trim());
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const mapError = (err) => {
        if (typeof err.response?.data?.message === 'string') {
            return err.response.data.message;
        }
        if (err.response?.data && typeof err.response.data === 'object') {
            const firstKey = Object.keys(err.response.data)[0];
            if (firstKey) {
                return `${firstKey}: ${err.response.data[firstKey]}`;
            }
        }
        return 'Request failed';
    };

    const submitEmployee = async (e) => {
        e.preventDefault();
        if (!canManage) return;

        setSubmitting(true);
        setError('');
        setSuccess('');

        const payload = {
            ...form,
            salary: Number(form.salary),
        };

        try {
            if (editingId) {
                await axios.put(`/employees/${editingId}`, payload);
                setSuccess('Employee updated successfully');
            } else {
                await axios.post('/employees', payload);
                setSuccess('Employee created successfully');
            }
            resetForm();
            await loadEmployees(serverSearch, page, sortBy, sortDir);
        } catch (err) {
            setError(mapError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (employee) => {
        if (!canManage) return;
        setEditingId(employee.id);
        setForm({
            employeeCode: employee.employeeCode,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone,
            department: employee.department,
            designation: employee.designation,
            dateOfJoining: employee.dateOfJoining,
            salary: employee.salary,
            status: employee.status,
        });
        setActiveSection('employees');
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const requestDelete = (employee) => {
        if (!canDelete) return;
        setPendingDelete(employee);
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        try {
            await axios.delete(`/employees/${pendingDelete.id}`);
            setPendingDelete(null);
            setSuccess('Employee deleted successfully');
            await loadEmployees(serverSearch, page, sortBy, sortDir);
        } catch (err) {
            setError(mapError(err));
        }
    };

    const toggleSort = (field) => {
        if (!field || field === 'actions') return;
        setPage(0);
        if (sortBy === field) {
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
    };

    const sortIndicator = (field) => {
        if (sortBy !== field) return '↕';
        return sortDir === 'asc' ? '↑' : '↓';
    };

    const statusClassName = (status) => {
        if (status === 'ACTIVE') return 'status-badge status-active';
        if (status === 'ON_LEAVE') return 'status-badge status-leave';
        return 'status-badge status-inactive';
    };

    const todayLabel = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <div className="dashboard-layout">
            <aside className="admin-sidebar glass-panel">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-logo">E</div>
                    <div>
                        <h3>EMS Pro</h3>
                        <p>Enterprise Suite</p>
                    </div>
                </div>

                <div className="sidebar-menu">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            className={`menu-item ${activeSection === item.key ? 'active' : ''}`}
                            type="button"
                            onClick={() => {
                                setError('');
                                setSuccess('');
                                setActiveSection(item.key);
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="sidebar-user-card">
                    <p>{adminView ? 'Administrator' : 'Employee'}</p>
                    <h4>{user?.username}</h4>
                    <span>{user?.roles?.join(', ')}</span>
                </div>
            </aside>

            <div className="dashboard-shell">
                <div className="dashboard-topbar glass-panel">
                    <div className="dashboard-topbar-copy">
                        <h1 className="dashboard-title">{titleBySection[activeSection]}</h1>
                        <p className="dashboard-subtitle">Operate workforce data with enterprise-grade controls and audit-ready workflows.</p>
                    </div>
                    <div className="dashboard-topbar-actions">
                        <span className="calendar-chip">{todayLabel}</span>
                        {(activeSection === 'employees' || activeSection === 'dashboard') && canManage && (
                            <button
                                className="btn btn-primary"
                                style={{ width: 'auto' }}
                                onClick={() => {
                                    setActiveSection('employees');
                                    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
                                }}
                                type="button"
                            >
                                + Add Employee
                            </button>
                        )}
                        <button className="btn btn-outline" style={{ width: 'auto' }} onClick={logout} type="button">
                            Logout
                        </button>
                    </div>
                </div>

                {(activeSection === 'dashboard' || activeSection === 'employees') && (
                    <>
                        <div className="dashboard-header">
                            <div className="dashboard-header-left">
                                <p className="dashboard-subtitle">
                                    Authenticated as <strong>{user?.username}</strong> ({user?.roles?.join(', ')})
                                </p>
                                <p className="search-hint">Auto-search runs after typing stops for 450ms.</p>
                            </div>
                            <form onSubmit={handleSearch} className="search-form">
                                <input
                                    className="form-input"
                                    placeholder="Search by name, code, email"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ minWidth: '280px', background: 'white' }}
                                />
                                <button className="btn btn-outline" style={{ width: 'auto', padding: '0.8rem 1rem' }} type="submit">
                                    Search
                                </button>
                            </form>
                        </div>

                        <div className="dashboard-stats">
                            <div className="stat-card">
                                <p>Total Records</p>
                                <h3>{meta.totalElements}</h3>
                            </div>
                            <div className="stat-card">
                                <p>Active (This Page)</p>
                                <h3>{activeCount}</h3>
                            </div>
                            <div className="stat-card">
                                <p>On Leave (This Page)</p>
                                <h3>{onLeaveCount}</h3>
                            </div>
                            <div className="stat-card">
                                <p>Inactive (This Page)</p>
                                <h3>{inactiveCount}</h3>
                            </div>
                        </div>
                    </>
                )}

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {activeSection === 'employees' && canManage && (
                    <div className="glass-panel form-panel" ref={formRef}>
                        <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Edit Employee' : 'Add Employee'}</h3>
                        <form onSubmit={submitEmployee} className="employee-form-grid">
                            <input className="form-input" placeholder="Employee Code" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} required />
                            <input className="form-input" placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                            <input className="form-input" placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                            <input className="form-input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            <input className="form-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                            <input className="form-input" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
                            <input className="form-input" placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required />
                            <input className="form-input" type="date" value={form.dateOfJoining} onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })} required />
                            <input className="form-input" type="number" min="1" step="0.01" placeholder="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} required />
                            <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="ON_LEAVE">ON_LEAVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                            <button className="btn btn-primary" disabled={submitting} type="submit" style={{ width: 'auto' }}>
                                {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                            </button>
                            {editingId && (
                                <button className="btn btn-outline" type="button" style={{ width: 'auto' }} onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {(activeSection === 'dashboard' || activeSection === 'employees') && (
                    <>
                        <div className="glass-panel table-shell">
                            {loading ? (
                                <>
                                    <div className="desktop-table">
                                        <table className="employee-table">
                                            <thead>
                                                <tr>
                                                    {columns.map((column) => (
                                                        <th key={column.key}>{column.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.from({ length: 5 }).map((_, index) => (
                                                    <tr key={index}>
                                                        {Array.from({ length: 7 }).map((__, idx) => (
                                                            <td key={idx}><div className="skeleton-line"></div></td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mobile-cards">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div className="employee-card" key={index}>
                                                <div className="skeleton-line"></div>
                                                <div className="skeleton-line"></div>
                                                <div className="skeleton-line"></div>
                                                <div className="skeleton-line"></div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : employees.length === 0 ? (
                                <div className="empty-state">
                                    <h3>No employees found</h3>
                                    <p>Try a different search or create a new employee record.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="desktop-table">
                                        <table className="employee-table">
                                            <thead>
                                                <tr>
                                                    {columns.map((column) => (
                                                        <th key={column.key}>
                                                            {column.sortable ? (
                                                                <button
                                                                    className="sort-btn"
                                                                    onClick={() => toggleSort(column.key)}
                                                                    type="button"
                                                                >
                                                                    {column.label}
                                                                    <span>{sortIndicator(column.key)}</span>
                                                                </button>
                                                            ) : (
                                                                column.label
                                                            )}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employees.map((employee) => (
                                                    <tr key={employee.id}>
                                                        <td>{employee.employeeCode}</td>
                                                        <td>{employee.firstName} {employee.lastName}</td>
                                                        <td>{employee.department}</td>
                                                        <td>{employee.designation}</td>
                                                        <td>{employee.email}</td>
                                                        <td><span className={statusClassName(employee.status)}>{employee.status}</span></td>
                                                        <td className="employee-actions">
                                                            {canManage && (
                                                                <button className="btn btn-outline" style={{ width: 'auto', padding: '0.4rem 0.6rem' }} onClick={() => startEdit(employee)}>
                                                                    Edit
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button className="btn btn-danger" style={{ width: 'auto', padding: '0.4rem 0.6rem' }} onClick={() => requestDelete(employee)}>
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mobile-cards">
                                        {employees.map((employee) => (
                                            <div className="employee-card" key={employee.id}>
                                                <div className="employee-card-top">
                                                    <h4>{employee.firstName} {employee.lastName}</h4>
                                                    <span className={statusClassName(employee.status)}>{employee.status}</span>
                                                </div>
                                                <p><strong>Code:</strong> {employee.employeeCode}</p>
                                                <p><strong>Email:</strong> {employee.email}</p>
                                                <p><strong>Department:</strong> {employee.department}</p>
                                                <p><strong>Designation:</strong> {employee.designation}</p>
                                                <div className="employee-actions" style={{ marginTop: '0.6rem' }}>
                                                    {canManage && (
                                                        <button className="btn btn-outline" style={{ width: 'auto', padding: '0.4rem 0.6rem' }} onClick={() => startEdit(employee)}>
                                                            Edit
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button className="btn btn-danger" style={{ width: 'auto', padding: '0.4rem 0.6rem' }} onClick={() => requestDelete(employee)}>
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pagination-bar">
                            <span>Total Employees: {meta.totalElements}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button className="btn btn-outline" style={{ width: 'auto', padding: '0.4rem 0.6rem' }} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                                    Prev
                                </button>
                                <span>Page {meta.totalPages === 0 ? 0 : page + 1} / {meta.totalPages}</span>
                                <button className="btn btn-outline" style={{ width: 'auto', padding: '0.4rem 0.6rem' }} disabled={meta.last || meta.totalPages === 0} onClick={() => setPage((p) => p + 1)}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeSection === 'departments' && (
                    <div className="glass-panel table-shell">
                        {deptLoading ? (
                            <p>Loading departments...</p>
                        ) : departments.length === 0 ? (
                            <div className="empty-state">
                                <h3>No departments found</h3>
                                <p>Ask an admin to create departments.</p>
                            </div>
                        ) : (
                            <div className="desktop-table">
                                <table className="employee-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Manager ID</th>
                                            <th>Employees</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departments.map((department) => (
                                            <tr key={department.id}>
                                                <td>{department.name}</td>
                                                <td>{department.description || '-'}</td>
                                                <td>{department.managerEmployeeId || '-'}</td>
                                                <td>{department.employeeCount}</td>
                                                <td>{department.active ? 'ACTIVE' : 'INACTIVE'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {(activeSection === 'leave' || activeSection === 'attendance' || activeSection === 'payroll') && (
                    <div className="glass-panel section-placeholder">
                        <h3>{titleBySection[activeSection]}</h3>
                        <p>
                            This module shell is now navigable. Next pass will attach complete workflows, approvals, reports,
                            and enterprise forms for this section.
                        </p>
                    </div>
                )}
            </div>

            {pendingDelete && (
                <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirm Deletion</h3>
                        <p>
                            Are you sure you want to delete <strong>{pendingDelete.firstName} {pendingDelete.lastName}</strong> ({pendingDelete.employeeCode})?
                            This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-outline" style={{ width: 'auto' }} onClick={() => setPendingDelete(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" style={{ width: 'auto' }} onClick={confirmDelete}>
                                Delete Employee
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
