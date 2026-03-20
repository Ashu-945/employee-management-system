import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const emptyEmployeeForm = {
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    dateOfBirth: '',
    address: '',
    profilePhotoUrl: '',
    dateOfJoining: '',
    salary: '',
    status: 'ACTIVE',
};

const emptyDepartmentForm = {
    name: '',
    description: '',
    managerEmployeeId: '',
    active: true,
};

const attendanceSchedule = [
    { day: 'Mon', tag: 'Attend', theme: 'ok', detail: 'Sprint review' },
    { day: 'Tue', tag: 'WFH', theme: 'soft', detail: 'Hiring sync' },
    { day: 'Wed', tag: 'Attend', theme: 'ok', detail: 'Payroll approval' },
    { day: 'Thu', tag: 'Leave', theme: 'warn', detail: 'Personal leave' },
    { day: 'Fri', tag: 'Attend', theme: 'ok', detail: 'Town hall' },
    { day: 'Sat', tag: 'Weekend', theme: 'muted', detail: 'Off day' },
    { day: 'Sun', tag: 'Weekend', theme: 'muted', detail: 'Off day' },
];

const makePayrollInsights = (employees) => {
    const totalPayroll = employees.reduce((sum, employee) => sum + Number(employee.salary || 0), 0);
    const avgPayroll = employees.length ? totalPayroll / employees.length : 0;
    return [
        { label: 'Monthly Payroll', value: currency(totalPayroll), note: 'Live from employee records' },
        { label: 'Average Salary', value: currency(avgPayroll), note: 'Based on active results' },
        { label: 'Pending Payouts', value: Math.max(1, Math.ceil(employees.length / 4)), note: 'Awaiting finance release' },
        { label: 'Benefits Budget', value: currency(totalPayroll * 0.18), note: 'Projected allocation' },
    ];
};

const workspaceNav = [
    { key: 'dashboard', label: 'Overview', route: '/admin/dashboard' },
    { key: 'employees', label: 'Employees', route: '/admin/employees' },
    { key: 'employee-form', label: 'Add Employee', route: '/admin/employees/new' },
    { key: 'departments', label: 'Departments', route: '/admin/departments' },
    { key: 'attendance', label: 'Attendance', route: '/admin/attendance' },
    { key: 'payroll', label: 'Payroll', route: '/admin/payroll' },
];

function currency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

function humanDate(value) {
    if (!value) return 'Not set';
    return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function statusClassName(status) {
    if (status === 'ACTIVE') return 'tone-pill tone-success';
    if (status === 'ON_LEAVE') return 'tone-pill tone-warning';
    return 'tone-pill tone-muted';
}

function initials(name) {
    return (name || 'HR')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

function Dashboard({ adminView = false, view = 'dashboard' }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { id } = useParams();

    const displayName = user?.name || user?.email || 'Team Member';
    const todayLabel = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employeeProfile, setEmployeeProfile] = useState(null);
    const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm);
    const [departmentForm, setDepartmentForm] = useState(emptyDepartmentForm);
    const [loading, setLoading] = useState(false);
    const [departmentsLoading, setDepartmentsLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingDepartmentId, setEditingDepartmentId] = useState(null);
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const visibleEmployees = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return employees;
        return employees.filter((employee) => {
            const haystack = [
                employee.employeeCode,
                employee.firstName,
                employee.lastName,
                employee.email,
                employee.department,
                employee.designation,
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(query);
        });
    }, [employees, search]);

    const dashboardStats = useMemo(() => {
        const activeEmployees = employees.filter((employee) => employee.status === 'ACTIVE').length;
        const onLeaveEmployees = employees.filter((employee) => employee.status === 'ON_LEAVE').length;
        const totalPayroll = employees.reduce((sum, employee) => sum + Number(employee.salary || 0), 0);
        return [
            { label: 'Total Employees', value: employees.length, note: 'Across all departments' },
            { label: 'Active Now', value: activeEmployees, note: 'Ready for deployment' },
            { label: 'On Leave', value: onLeaveEmployees, note: 'This payroll cycle' },
            { label: 'Monthly Payroll', value: currency(totalPayroll), note: 'Estimated gross payout' },
        ];
    }, [employees]);

    const peopleByDepartment = useMemo(() => {
        return departments.map((department) => ({
            name: department.name,
            value: department.employeeCount,
            active: department.active,
        }));
    }, [departments]);

    const loadEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/employees', {
                params: {
                    search: '',
                    page: 0,
                    size: 30,
                    sortBy: 'id',
                    sortDir: 'desc',
                },
            });
            setEmployees(response.data.content || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to load employees.');
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        setDepartmentsLoading(true);
        try {
            const response = await axios.get('/departments');
            setDepartments(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to load departments.');
        } finally {
            setDepartmentsLoading(false);
        }
    };

    const loadEmployeeProfile = async (employeeId) => {
        if (!employeeId) return;
        setProfileLoading(true);
        try {
            const response = await axios.get(`/employees/${employeeId}`);
            setEmployeeProfile(response.data);
            setEmployeeForm({
                employeeCode: response.data.employeeCode || '',
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                email: response.data.email || '',
                phone: response.data.phone || '',
                department: response.data.department || '',
                designation: response.data.designation || '',
                dateOfBirth: response.data.dateOfBirth || '',
                address: response.data.address || '',
                profilePhotoUrl: response.data.profilePhotoUrl || '',
                dateOfJoining: response.data.dateOfJoining || '',
                salary: response.data.salary || '',
                status: response.data.status || 'ACTIVE',
            });
            setEditingEmployeeId(response.data.id);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to load employee profile.');
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        if (!adminView) return;
        loadEmployees();
        loadDepartments();
    }, [adminView]);

    useEffect(() => {
        if (!adminView) return;
        if (view === 'profile' || view === 'employee-form') {
            if (id) {
                loadEmployeeProfile(id);
            } else if (view === 'employee-form') {
                setEmployeeProfile(null);
                setEmployeeForm(emptyEmployeeForm);
                setEditingEmployeeId(null);
            }
        } else {
            setEmployeeProfile(null);
            setEditingEmployeeId(null);
        }
    }, [adminView, view, id]);

    const handleEmployeeSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        const payload = {
            ...employeeForm,
            salary: Number(employeeForm.salary),
        };

        try {
            if (editingEmployeeId) {
                await axios.put(`/employees/${editingEmployeeId}`, payload);
                setSuccess('Employee record updated successfully.');
            } else {
                await axios.post('/employees', payload);
                setSuccess('Employee created successfully.');
            }
            setEmployeeForm(emptyEmployeeForm);
            setEditingEmployeeId(null);
            await loadEmployees();
            navigate('/admin/employees');
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to save employee.');
        }
    };

    const handleDeleteEmployee = async () => {
        if (!deleteTarget) return;
        try {
            await axios.delete(`/employees/${deleteTarget.id}`);
            setSuccess('Employee deleted successfully.');
            setDeleteTarget(null);
            await loadEmployees();
            if (view === 'profile') {
                navigate('/admin/employees');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to delete employee.');
        }
    };

    const handleDepartmentSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        const payload = {
            ...departmentForm,
            managerEmployeeId: departmentForm.managerEmployeeId ? Number(departmentForm.managerEmployeeId) : null,
        };

        try {
            if (editingDepartmentId) {
                await axios.put(`/departments/${editingDepartmentId}`, payload);
                setSuccess('Department updated successfully.');
            } else {
                await axios.post('/departments', payload);
                setSuccess('Department created successfully.');
            }
            setDepartmentForm(emptyDepartmentForm);
            setEditingDepartmentId(null);
            await loadDepartments();
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to save department.');
        }
    };

    const beginDepartmentEdit = (department) => {
        setEditingDepartmentId(department.id);
        setDepartmentForm({
            name: department.name || '',
            description: department.description || '',
            managerEmployeeId: department.managerEmployeeId || '',
            active: !!department.active,
        });
    };

    const renderEmployeeDashboard = () => (
        <div className="workspace-grid">
            <section className="workspace-hero workspace-card">
                <div>
                    <p className="workspace-kicker">Employee Portal</p>
                    <h1>Welcome back, {displayName.split(' ')[0]}.</h1>
                    <p className="workspace-copy">
                        Your workspace is ready with profile details, quick attendance insights, and current employment status.
                    </p>
                </div>
                <div className="hero-badge-column">
                    <div className="hero-mini-card">
                        <span>Role</span>
                        <strong>{user?.roles?.join(', ') || 'Employee'}</strong>
                    </div>
                    <div className="hero-mini-card">
                        <span>Today</span>
                        <strong>{todayLabel}</strong>
                    </div>
                </div>
            </section>

            <section className="employee-self-grid">
                <article className="workspace-card profile-summary-card">
                    <div className="profile-avatar-large">{initials(displayName)}</div>
                    <h3>{displayName}</h3>
                    <p>{user?.email}</p>
                    <div className="profile-meta-list">
                        <div><span>Account</span><strong>Active</strong></div>
                        <div><span>Access</span><strong>{user?.roles?.[0] || 'Employee'}</strong></div>
                    </div>
                </article>

                <article className="workspace-card">
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">Attendance Snapshot</p>
                            <h3>This Week</h3>
                        </div>
                    </div>
                    <div className="metric-strip">
                        <div><strong>40h</strong><span>Scheduled</span></div>
                        <div><strong>37.5h</strong><span>Logged</span></div>
                        <div><strong>96%</strong><span>Presence</span></div>
                    </div>
                    <div className="attendance-week-grid">
                        {attendanceSchedule.map((item) => (
                            <div key={item.day} className={`attendance-chip tone-${item.theme}`}>
                                <strong>{item.day}</strong>
                                <span>{item.tag}</span>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );

    const renderOverview = () => (
        <div className="workspace-grid">
            <section className="workspace-hero workspace-card">
                <div>
                    <p className="workspace-kicker">Admin Command Center</p>
                    <h1>Run your HRMS from one operational workspace.</h1>
                    <p className="workspace-copy">
                        Structured around workforce planning, departments, attendance, and payroll decisions with a warm enterprise look.
                    </p>
                    <div className="hero-actions">
                        <Link to="/admin/employees/new" className="btn btn-primary">Create Employee</Link>
                        <Link to="/admin/departments" className="btn btn-outline">Manage Departments</Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-visual-card hero-accent-one"></div>
                    <div className="hero-visual-card hero-accent-two"></div>
                    <div className="hero-visual-figure">
                        <div className="hero-visual-header"></div>
                        <div className="hero-visual-body"></div>
                    </div>
                </div>
            </section>

            <section className="stat-grid">
                {dashboardStats.map((stat) => (
                    <article className="workspace-card stat-panel" key={stat.label}>
                        <span>{stat.label}</span>
                        <strong>{stat.value}</strong>
                        <p>{stat.note}</p>
                    </article>
                ))}
            </section>

            <section className="workspace-split">
                <article className="workspace-card">
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">Performance View</p>
                            <h3>Department capacity</h3>
                        </div>
                    </div>
                    <div className="chart-stack">
                        {peopleByDepartment.length === 0 ? (
                            <div className="empty-inline">Departments will appear here once loaded.</div>
                        ) : (
                            peopleByDepartment.map((item) => (
                                <div key={item.name} className="bar-row">
                                    <div className="bar-row-label">
                                        <strong>{item.name}</strong>
                                        <span>{item.value} members</span>
                                    </div>
                                    <div className="bar-track">
                                        <div className="bar-fill" style={{ width: `${Math.min(100, item.value * 12)}%` }}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </article>

                <article className="workspace-card">
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">Recent Team Records</p>
                            <h3>Newest employees</h3>
                        </div>
                        <Link to="/admin/employees" className="text-link">View all</Link>
                    </div>
                    <div className="mini-list">
                        {employees.slice(0, 5).map((employee) => (
                            <Link to={`/admin/employees/${employee.id}`} className="mini-list-item" key={employee.id}>
                                <div className="mini-list-avatar">{initials(`${employee.firstName} ${employee.lastName}`)}</div>
                                <div>
                                    <strong>{employee.firstName} {employee.lastName}</strong>
                                    <p>{employee.designation} • {employee.department}</p>
                                </div>
                                <span className={statusClassName(employee.status)}>{employee.status}</span>
                            </Link>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );

    const renderEmployees = () => (
        <div className="workspace-grid">
            <section className="workspace-card">
                <div className="section-heading section-heading-stack">
                    <div>
                        <p className="section-kicker">Employee List</p>
                        <h3>Directory and quick actions</h3>
                    </div>
                    <div className="toolbar-row">
                        <input
                            className="form-input toolbar-search"
                            placeholder="Search by name, code, email, department"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <Link to="/admin/employees/new" className="btn btn-primary toolbar-button">New employee</Link>
                    </div>
                </div>

                <div className="employee-directory-grid">
                    {visibleEmployees.map((employee) => (
                        <article className="directory-card" key={employee.id}>
                            <div className="directory-card-head">
                                <div className="directory-avatar">{initials(`${employee.firstName} ${employee.lastName}`)}</div>
                                <span className={statusClassName(employee.status)}>{employee.status}</span>
                            </div>
                            <h4>{employee.firstName} {employee.lastName}</h4>
                            <p>{employee.designation}</p>
                            <div className="directory-meta">
                                <span>{employee.department}</span>
                                <span>{employee.employeeCode}</span>
                            </div>
                            <div className="directory-actions">
                                <Link to={`/admin/employees/${employee.id}`} className="btn btn-outline">Profile</Link>
                                <Link to={`/admin/employees/${employee.id}/edit`} className="btn btn-secondary">Edit</Link>
                                <button type="button" className="btn btn-danger" onClick={() => setDeleteTarget(employee)}>Delete</button>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="responsive-table">
                    <table className="workspace-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Designation</th>
                                <th>Email</th>
                                <th>Salary</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleEmployees.map((employee) => (
                                <tr key={employee.id}>
                                    <td>
                                        <div className="table-person">
                                            <div className="mini-list-avatar">{initials(`${employee.firstName} ${employee.lastName}`)}</div>
                                            <div>
                                                <strong>{employee.firstName} {employee.lastName}</strong>
                                                <span>{employee.employeeCode}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{employee.department}</td>
                                    <td>{employee.designation}</td>
                                    <td>{employee.email}</td>
                                    <td>{currency(employee.salary)}</td>
                                    <td><span className={statusClassName(employee.status)}>{employee.status}</span></td>
                                    <td>
                                        <div className="table-actions">
                                            <Link to={`/admin/employees/${employee.id}`} className="table-link">Open</Link>
                                            <Link to={`/admin/employees/${employee.id}/edit`} className="table-link">Edit</Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );

    const renderProfile = () => {
        if (profileLoading) {
            return <div className="workspace-card">Loading employee profile...</div>;
        }

        if (!employeeProfile) {
            return <div className="workspace-card">Employee profile could not be loaded.</div>;
        }

        return (
            <div className="workspace-grid">
                <section className="profile-grid">
                    <article className="workspace-card profile-focus-card">
                        <div className="profile-focus-top">
                            <div className="profile-avatar-xl">{initials(`${employeeProfile.firstName} ${employeeProfile.lastName}`)}</div>
                            <div>
                                <p className="section-kicker">Employee Profile</p>
                                <h2>{employeeProfile.firstName} {employeeProfile.lastName}</h2>
                                <p>{employeeProfile.designation} • {employeeProfile.department}</p>
                            </div>
                            <span className={statusClassName(employeeProfile.status)}>{employeeProfile.status}</span>
                        </div>
                        <div className="profile-stat-band">
                            <div><strong>{employeeProfile.employeeCode}</strong><span>Employee ID</span></div>
                            <div><strong>{humanDate(employeeProfile.dateOfJoining)}</strong><span>Joined</span></div>
                            <div><strong>{currency(employeeProfile.salary)}</strong><span>Salary</span></div>
                        </div>
                        <div className="profile-action-row">
                            <Link to={`/admin/employees/${employeeProfile.id}/edit`} className="btn btn-primary">Edit profile</Link>
                            <button type="button" className="btn btn-danger" onClick={() => setDeleteTarget(employeeProfile)}>Delete employee</button>
                        </div>
                    </article>

                    <article className="workspace-card detail-card">
                        <div className="section-heading">
                            <div>
                                <p className="section-kicker">Basic Information</p>
                                <h3>Contact and identity</h3>
                            </div>
                        </div>
                        <div className="detail-grid">
                            <div><span>Email</span><strong>{employeeProfile.email}</strong></div>
                            <div><span>Phone</span><strong>{employeeProfile.phone}</strong></div>
                            <div><span>Date of Birth</span><strong>{humanDate(employeeProfile.dateOfBirth)}</strong></div>
                            <div><span>Updated</span><strong>{humanDate(employeeProfile.updatedAt || employeeProfile.createdAt)}</strong></div>
                            <div className="detail-span"><span>Address</span><strong>{employeeProfile.address || 'Not added yet'}</strong></div>
                        </div>
                    </article>
                </section>
            </div>
        );
    };

    const renderEmployeeForm = () => (
        <div className="workspace-grid">
            <section className="form-showcase">
                <aside className="workspace-card form-control-rail">
                    <p className="section-kicker">Controls</p>
                    <h3>Form composer feel</h3>
                    <div className="control-chip-list">
                        {['Input', 'Department', 'Salary', 'Address', 'Status', 'Profile'].map((item) => (
                            <div className="control-chip" key={item}>{item}</div>
                        ))}
                    </div>
                </aside>

                <article className="workspace-card form-studio">
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">{editingEmployeeId ? 'Update Employee' : 'Create Employee'}</p>
                            <h3>Employee details form</h3>
                        </div>
                        {editingEmployeeId && (
                            <span className="tone-pill tone-soft">Editing #{editingEmployeeId}</span>
                        )}
                    </div>

                    <form className="showcase-form-grid" onSubmit={handleEmployeeSubmit}>
                        <label>
                            <span>Employee Code</span>
                            <input className="form-input" value={employeeForm.employeeCode} onChange={(event) => setEmployeeForm({ ...employeeForm, employeeCode: event.target.value })} required />
                        </label>
                        <label>
                            <span>First Name</span>
                            <input className="form-input" value={employeeForm.firstName} onChange={(event) => setEmployeeForm({ ...employeeForm, firstName: event.target.value })} required />
                        </label>
                        <label>
                            <span>Last Name</span>
                            <input className="form-input" value={employeeForm.lastName} onChange={(event) => setEmployeeForm({ ...employeeForm, lastName: event.target.value })} required />
                        </label>
                        <label>
                            <span>Email</span>
                            <input type="email" className="form-input" value={employeeForm.email} onChange={(event) => setEmployeeForm({ ...employeeForm, email: event.target.value })} required />
                        </label>
                        <label>
                            <span>Phone</span>
                            <input className="form-input" value={employeeForm.phone} onChange={(event) => setEmployeeForm({ ...employeeForm, phone: event.target.value })} required />
                        </label>
                        <label>
                            <span>Department</span>
                            <input className="form-input" value={employeeForm.department} onChange={(event) => setEmployeeForm({ ...employeeForm, department: event.target.value })} required />
                        </label>
                        <label>
                            <span>Designation</span>
                            <input className="form-input" value={employeeForm.designation} onChange={(event) => setEmployeeForm({ ...employeeForm, designation: event.target.value })} required />
                        </label>
                        <label>
                            <span>Date of Birth</span>
                            <input type="date" className="form-input" value={employeeForm.dateOfBirth} onChange={(event) => setEmployeeForm({ ...employeeForm, dateOfBirth: event.target.value })} />
                        </label>
                        <label>
                            <span>Date of Joining</span>
                            <input type="date" className="form-input" value={employeeForm.dateOfJoining} onChange={(event) => setEmployeeForm({ ...employeeForm, dateOfJoining: event.target.value })} required />
                        </label>
                        <label>
                            <span>Salary</span>
                            <input type="number" min="1" step="0.01" className="form-input" value={employeeForm.salary} onChange={(event) => setEmployeeForm({ ...employeeForm, salary: event.target.value })} required />
                        </label>
                        <label>
                            <span>Status</span>
                            <select className="form-input" value={employeeForm.status} onChange={(event) => setEmployeeForm({ ...employeeForm, status: event.target.value })}>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="ON_LEAVE">ON_LEAVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </label>
                        <label className="form-span-2">
                            <span>Address</span>
                            <textarea className="form-input form-textarea" value={employeeForm.address} onChange={(event) => setEmployeeForm({ ...employeeForm, address: event.target.value })}></textarea>
                        </label>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">{editingEmployeeId ? 'Save Changes' : 'Create Employee'}</button>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => {
                                    setEmployeeForm(emptyEmployeeForm);
                                    setEditingEmployeeId(null);
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </article>
            </section>
        </div>
    );

    const renderDepartments = () => (
        <div className="workspace-grid">
            <section className="workspace-split">
                <article className="workspace-card">
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">Department Management</p>
                            <h3>Build the org structure</h3>
                        </div>
                    </div>
                    <form className="department-form-grid" onSubmit={handleDepartmentSubmit}>
                        <label>
                            <span>Name</span>
                            <input className="form-input" value={departmentForm.name} onChange={(event) => setDepartmentForm({ ...departmentForm, name: event.target.value })} required />
                        </label>
                        <label>
                            <span>Manager Employee ID</span>
                            <input className="form-input" value={departmentForm.managerEmployeeId} onChange={(event) => setDepartmentForm({ ...departmentForm, managerEmployeeId: event.target.value })} />
                        </label>
                        <label className="form-span-2">
                            <span>Description</span>
                            <textarea className="form-input form-textarea" value={departmentForm.description} onChange={(event) => setDepartmentForm({ ...departmentForm, description: event.target.value })}></textarea>
                        </label>
                        <label className="toggle-row">
                            <input type="checkbox" checked={departmentForm.active} onChange={(event) => setDepartmentForm({ ...departmentForm, active: event.target.checked })} />
                            <span>Department is active</span>
                        </label>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">{editingDepartmentId ? 'Update Department' : 'Create Department'}</button>
                            <button type="button" className="btn btn-outline" onClick={() => {
                                setEditingDepartmentId(null);
                                setDepartmentForm(emptyDepartmentForm);
                            }}>
                                Clear
                            </button>
                        </div>
                    </form>
                </article>

                <article className="workspace-card">
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">Organization Units</p>
                            <h3>Department cards</h3>
                        </div>
                    </div>
                    <div className="department-card-grid">
                        {departmentsLoading ? (
                            <div className="empty-inline">Loading departments...</div>
                        ) : departments.map((department) => (
                            <article className="department-card" key={department.id}>
                                <div className="department-card-head">
                                    <h4>{department.name}</h4>
                                    <span className={department.active ? 'tone-pill tone-success' : 'tone-pill tone-muted'}>
                                        {department.active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                                <p>{department.description || 'No description provided yet.'}</p>
                                <div className="department-card-meta">
                                    <div><span>Employees</span><strong>{department.employeeCount}</strong></div>
                                    <div><span>Manager ID</span><strong>{department.managerEmployeeId || '-'}</strong></div>
                                </div>
                                <button type="button" className="btn btn-outline" onClick={() => beginDepartmentEdit(department)}>
                                    Edit Department
                                </button>
                            </article>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );

    const renderAttendance = () => (
        <div className="workspace-grid">
            <section className="workspace-card attendance-feature">
                <div className="attendance-sidebar-card">
                    <div className="profile-avatar-xl">{initials(displayName)}</div>
                    <h3>{displayName}</h3>
                    <p>Hiring and operations</p>
                    <div className="attendance-summary-list">
                        <div><strong>12h 30m</strong><span>Total work</span></div>
                        <div><strong>5h 15m</strong><span>Productive</span></div>
                        <div><strong>98%</strong><span>Presence</span></div>
                    </div>
                </div>
                <div className="attendance-main-card">
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">Attendance Management</p>
                            <h3>Calendar and productivity</h3>
                        </div>
                        <span className="tone-pill tone-soft">Current session: 08h 00m</span>
                    </div>
                    <div className="timeline-bars">
                        <div className="timeline-group"><span>Total</span><div className="timeline-track"><div style={{ width: '86%' }}></div></div></div>
                        <div className="timeline-group"><span>Productive</span><div className="timeline-track"><div style={{ width: '62%' }}></div></div></div>
                        <div className="timeline-group"><span>Neutral</span><div className="timeline-track"><div style={{ width: '38%' }}></div></div></div>
                    </div>
                    <div className="attendance-calendar-grid">
                        {attendanceSchedule.map((item) => (
                            <article key={item.day} className="attendance-day-card">
                                <strong>{item.day}</strong>
                                <span className={`tone-pill tone-${item.theme}`}>{item.tag}</span>
                                <p>{item.detail}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );

    const renderPayroll = () => (
        <div className="workspace-grid">
            <section className="stat-grid">
                {makePayrollInsights(employees).map((item) => (
                    <article className="workspace-card stat-panel" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <p>{item.note}</p>
                    </article>
                ))}
            </section>

            <section className="workspace-card">
                <div className="section-heading">
                    <div>
                        <p className="section-kicker">Payroll and Salary</p>
                        <h3>Compensation overview</h3>
                    </div>
                </div>
                <div className="responsive-table">
                    <table className="workspace-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Base Salary</th>
                                <th>Status</th>
                                <th>Payout Stage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee, index) => (
                                <tr key={employee.id}>
                                    <td>
                                        <div className="table-person">
                                            <div className="mini-list-avatar">{initials(`${employee.firstName} ${employee.lastName}`)}</div>
                                            <div>
                                                <strong>{employee.firstName} {employee.lastName}</strong>
                                                <span>{employee.designation}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{employee.department}</td>
                                    <td>{currency(employee.salary)}</td>
                                    <td><span className={statusClassName(employee.status)}>{employee.status}</span></td>
                                    <td><span className="tone-pill tone-soft">{index % 3 === 0 ? 'Approved' : index % 3 === 1 ? 'Pending' : 'Review'}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );

    const renderAdminPage = () => {
        if (loading && (view === 'dashboard' || view === 'employees' || view === 'payroll')) {
            return <div className="workspace-card">Loading workspace...</div>;
        }

        switch (view) {
            case 'employees':
                return renderEmployees();
            case 'profile':
                return renderProfile();
            case 'employee-form':
                return renderEmployeeForm();
            case 'departments':
                return renderDepartments();
            case 'attendance':
                return renderAttendance();
            case 'payroll':
                return renderPayroll();
            default:
                return renderOverview();
        }
    };

    if (!adminView) {
        return (
            <div className="workspace-layout employee-mode">
                <div className="workspace-main">
                    <div className="workspace-topbar workspace-card">
                        <div>
                            <p className="section-kicker">Employee Workspace</p>
                            <h2>Dashboard</h2>
                        </div>
                        <div className="topbar-actions">
                            <span className="calendar-chip">{todayLabel}</span>
                            <button className="btn btn-outline" type="button" onClick={logout}>Logout</button>
                        </div>
                    </div>
                    {renderEmployeeDashboard()}
                </div>
            </div>
        );
    }

    return (
        <div className="workspace-layout">
            <aside className="workspace-sidebar workspace-card">
                <div className="sidebar-top">
                    <div className="brand-mark">HR</div>
                    <div>
                        <h3>LogSign HRMS</h3>
                        <p>Admin suite</p>
                    </div>
                </div>

                <nav className="workspace-nav">
                    {workspaceNav.map((item) => (
                        <Link key={item.key} to={item.route} className={`workspace-nav-link ${view === item.key ? 'active' : ''}`}>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="workspace-profile-card">
                    <div className="profile-avatar-large">{initials(displayName)}</div>
                    <div>
                        <strong>{displayName}</strong>
                        <p>{user?.email}</p>
                    </div>
                    <span className="tone-pill tone-soft">{user?.roles?.[0] || 'Admin'}</span>
                </div>
            </aside>

            <div className="workspace-main">
                <div className="workspace-topbar workspace-card">
                    <div>
                        <p className="section-kicker">Human Resources Management</p>
                        <h2>
                            {view === 'dashboard' && 'Admin Dashboard'}
                            {view === 'employees' && 'Employee List'}
                            {view === 'profile' && 'Employee Profile'}
                            {view === 'employee-form' && 'Add / Create Employee'}
                            {view === 'departments' && 'Department Management'}
                            {view === 'attendance' && 'Attendance Management'}
                            {view === 'payroll' && 'Payroll / Salary'}
                        </h2>
                    </div>
                    <div className="topbar-actions">
                        <span className="calendar-chip">{todayLabel}</span>
                        <button className="btn btn-outline" type="button" onClick={logout}>Logout</button>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                {renderAdminPage()}
            </div>

            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal-card" onClick={(event) => event.stopPropagation()}>
                        <h3>Delete employee?</h3>
                        <p>
                            This will remove <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong> from the employee records.
                        </p>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={handleDeleteEmployee}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
