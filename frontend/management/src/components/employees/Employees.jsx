import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, User, Shield, ChevronDown, Check, Lock, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { parseError } from '../../utils/errorHandler';
import './Employees.css';

const Employees = () => {
    const [activeTab, setActiveTab] = useState('employees'); // 'employees' or 'users'
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editId, setEditId] = useState(null);

    // Custom User Dropdown State
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [userDropdownSearch, setUserDropdownSearch] = useState('');
    const userDropdownRef = useRef(null);

    // Close user dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Employee Form State
    const [formData, setFormData] = useState({
        user: '', // ID
        employee_id: '',
        phone: '',
        gender: 'male',
        date_of_birth: '',
        department: '',
        designation: '',
        salary: '',
        joining_date: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        status: 'active',
        // Read-only populated fields for UX
        first_name: '',
        last_name: '',
        email: ''
    });

    // User Form State
    const [userFormData, setUserFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'Employee'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [empRes, deptRes, userRes] = await Promise.all([
                api.get('employees/'),
                api.get('departments/'),
                api.get('accounts/users/')
            ]);
            setEmployees(empRes.data?.results || empRes.data || []);
            setDepartments(deptRes.data?.results || deptRes.data || []);
            setUsers(userRes.data?.results || userRes.data || []);
        } catch (err) {
            console.error('Failed to fetch data', err);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);

    // Filter logic
    const filteredEmployees = employees.filter(e =>
        e.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Users that do not yet have an Employee profile (available for profile creation)
    const availableUsers = users.filter(u => {
        // If editing an existing profile, keep the currently assigned user in the list
        if (editId !== null && formData.user && u.id?.toString() === formData.user?.toString()) {
            return true;
        }
        // Exclude if user has employee profile from backend flag
        if (u.has_employee_profile) {
            return false;
        }
        // Exclude if already linked to any employee by user ID or email
        const alreadyHasProfile = employees.some(emp =>
            (emp.user === u.id) ||
            (emp.email && u.email && emp.email.toLowerCase() === u.email.toLowerCase())
        );
        return !alreadyHasProfile;
    });

    const filteredDropdownUsers = availableUsers.filter(u => {
        if (!userDropdownSearch) return true;
        const q = userDropdownSearch.toLowerCase();
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
        return u.email?.toLowerCase().includes(q) || fullName.includes(q);
    });

    const selectedUserObj = users.find(u => u.id?.toString() === formData.user?.toString());

    const handleEdit = (emp) => {
        const linkedUser = users.find(u => u.id === emp.user);
        setFormData({
            user: emp.user,
            employee_id: emp.employee_id || '',
            phone: emp.phone || '',
            gender: emp.gender || 'male',
            date_of_birth: emp.date_of_birth || '',
            department: emp.department || '',
            designation: emp.designation || '',
            salary: emp.salary || '',
            joining_date: emp.joining_date || '',
            city: emp.city || '',
            state: emp.state || '',
            country: emp.country || '',
            pincode: emp.pincode || '',
            status: emp.status || 'active',
            first_name: linkedUser?.first_name || '',
            last_name: linkedUser?.last_name || '',
            email: linkedUser?.email || ''
        });
        setEditId(emp.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        try {
            await api.delete(`employees/${id}/`);
            toast.success('Employee deleted successfully');
            fetchData();
        } catch (err) {
            toast.error(parseError(err));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean up payload (remove read-only UX fields)
            const payload = { ...formData };
            delete payload.first_name;
            delete payload.last_name;
            delete payload.email;

            if (editId) {
                await api.put(`employees/${editId}/`, payload);
                toast.success('Employee updated successfully');
            } else {
                await api.post('employees/create/', payload);
                toast.success('Employee created successfully');
            }
            setShowForm(false);
            setEditId(null);
            fetchData();
        } catch (err) {
            toast.error(parseError(err));
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('accounts/register/', userFormData);
            toast.success('User account created successfully');
            setShowUserForm(false);
            fetchData();

            // Reset user form
            setUserFormData({
                email: '', password: '', first_name: '', last_name: '', role: 'Employee'
            });
        } catch (err) {
            toast.error(parseError(err));
        }
    };

    // Auto-generate the next serial Employee ID (e.g., EMP005)
    const generateNextEmpId = (empList) => {
        if (!empList || empList.length === 0) return 'EMP001';

        let maxId = 0;
        empList.forEach(emp => {
            if (emp.employee_id && emp.employee_id.toUpperCase().startsWith('EMP')) {
                const numPart = parseInt(emp.employee_id.toUpperCase().replace('EMP', ''), 10);
                if (!isNaN(numPart) && numPart > maxId) {
                    maxId = numPart;
                }
            }
        });

        const nextId = maxId + 1;
        return `EMP${nextId.toString().padStart(3, '0')}`;
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: '1rem' }}>
                <div>
                    <h1>Staff Management</h1>
                    <p>Manage backend user accounts and corporate employee profiles</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {activeTab === 'users' ? (
                        <button className="btn btn-primary" onClick={() => setShowUserForm(true)}>
                            <Plus size={18} /> Add User Account
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => {
                            setEditId(null);
                            setFormData({
                                user: '',
                                employee_id: generateNextEmpId(employees),
                                phone: '', gender: 'male', date_of_birth: '',
                                department: '', designation: '', salary: '', joining_date: '',
                                city: '', state: '', country: '', pincode: '', status: 'active',
                                first_name: '', last_name: '', email: ''
                            });
                            setShowForm(true);
                        }}>
                            <Plus size={18} /> Add Employee Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Custom Tab Navigation */}
            <div className="emp-tabs-nav">
                <button
                    className={`emp-tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
                    onClick={() => setActiveTab('employees')}
                >
                    <User size={18} />
                    Employee Profiles
                </button>
                <button
                    className={`emp-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Shield size={18} />
                    System User Accounts
                </button>
            </div>

            {/* CREATE EMPLOYEE MODAL */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h2>{editId ? 'Edit Employee Profile' : 'Create Employee Profile'}</h2>
                            <button className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="standard-form grid-form">

                            {/* User Account Custom Selector */}
                            <div className="form-group full-width custom-select-group" ref={userDropdownRef}>
                                <label>Select User Account (Required)</label>
                                
                                {/* Hidden native select for HTML5 form validation */}
                                <select
                                    required
                                    disabled={editId !== null}
                                    value={formData.user}
                                    onChange={() => {}}
                                    tabIndex={-1}
                                    className="hidden-validation-select"
                                >
                                    <option value="">Select Account</option>
                                    {availableUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.email}</option>
                                    ))}
                                </select>

                                {/* Custom Dropdown Trigger */}
                                <div
                                    className={`custom-select-trigger ${userDropdownOpen ? 'open' : ''} ${editId !== null ? 'disabled' : ''}`}
                                    onClick={() => {
                                        if (editId === null) setUserDropdownOpen(!userDropdownOpen);
                                    }}
                                >
                                    <div className="custom-select-selected">
                                        {selectedUserObj ? (
                                            <div className="selected-user-preview">
                                                <div className="user-avatar-mini">
                                                    {(selectedUserObj.first_name?.[0] || selectedUserObj.email?.[0] || 'U').toUpperCase()}
                                                </div>
                                                <div className="selected-user-details">
                                                    <span className="selected-name">
                                                        {(selectedUserObj.first_name || selectedUserObj.last_name)
                                                            ? `${selectedUserObj.first_name} ${selectedUserObj.last_name}`.trim()
                                                            : selectedUserObj.email}
                                                    </span>
                                                    <span className="selected-email">{selectedUserObj.email}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="custom-select-placeholder">-- Choose an existing User Account --</span>
                                        )}
                                    </div>
                                    <div className="custom-select-chevron">
                                        {editId !== null ? <Lock size={15} /> : <ChevronDown size={18} className={userDropdownOpen ? 'rotate-180' : ''} />}
                                    </div>
                                </div>

                                {/* Custom Dropdown Menu */}
                                {userDropdownOpen && (
                                    <div className="custom-select-menu">
                                        {availableUsers.length > 5 && (
                                            <div className="custom-select-search-box">
                                                <Search size={14} />
                                                <input
                                                    type="text"
                                                    placeholder="Filter accounts..."
                                                    value={userDropdownSearch}
                                                    onChange={e => setUserDropdownSearch(e.target.value)}
                                                    onClick={e => e.stopPropagation()}
                                                    autoFocus
                                                />
                                            </div>
                                        )}
                                        <div className="custom-select-list">
                                            {filteredDropdownUsers.length === 0 ? (
                                                <div className="custom-select-empty">
                                                    {availableUsers.length === 0
                                                        ? 'All users already have an employee profile'
                                                        : 'No matching user accounts'}
                                                </div>
                                            ) : (
                                                filteredDropdownUsers.map(u => {
                                                    const isSelected = formData.user?.toString() === u.id?.toString();
                                                    const displayName = (u.first_name || u.last_name)
                                                        ? `${u.first_name} ${u.last_name}`.trim()
                                                        : '';
                                                    return (
                                                        <div
                                                            key={u.id}
                                                            className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                setFormData({
                                                                    ...formData,
                                                                    user: u.id,
                                                                    first_name: u.first_name || '',
                                                                    last_name: u.last_name || '',
                                                                    email: u.email || ''
                                                                });
                                                                setUserDropdownOpen(false);
                                                                setUserDropdownSearch('');
                                                            }}
                                                        >
                                                            <div className="user-avatar-mini">
                                                                {(u.first_name?.[0] || u.email?.[0] || 'U').toUpperCase()}
                                                            </div>
                                                            <div className="option-info">
                                                                <div className="option-name">{displayName || u.email}</div>
                                                                <div className="option-email">{u.email}</div>
                                                            </div>
                                                            {isSelected && <Check size={16} className="option-check" />}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>First Name</label>
                                <div className="readonly-input-wrapper">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.first_name}
                                        className="form-input form-input-readonly"
                                        placeholder="Auto-synced from user"
                                    />
                                    <Lock size={14} className="readonly-icon" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <div className="readonly-input-wrapper">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.last_name}
                                        className="form-input form-input-readonly"
                                        placeholder="Auto-synced from user"
                                    />
                                    <Lock size={14} className="readonly-icon" />
                                </div>
                            </div>

                            <div className="form-section-divider">
                                <h3>Corporate Details</h3>
                            </div>

                            <div className="form-group">
                                <label>Employee ID</label>
                                <input type="text" required value={formData.employee_id} onChange={e => setFormData({ ...formData, employee_id: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Designation</label>
                                <input type="text" required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="form-input">
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Salary</label>
                                <input type="number" step="0.01" required value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input type="date" required value={formData.date_of_birth} onClick={(e) => { try { e.target.showPicker(); } catch {} }} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Joining Date</label>
                                <input type="date" required value={formData.joining_date} onClick={(e) => { try { e.target.showPicker(); } catch {} }} onChange={e => setFormData({ ...formData, joining_date: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="form-input">
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input type="text" required value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input type="text" required value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Pincode</label>
                                <input type="text" required value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-input">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="resigned">Resigned</option>
                                    <option value="terminated">Terminated</option>
                                </select>
                            </div>

                            <div className="modal-actions full-width">
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE USER MODAL */}
            {showUserForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Create User Account</h2>
                            <button className="close-btn" onClick={() => setShowUserForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleUserSubmit} className="standard-form grid-form">
                            <div className="form-group full-width">
                                <label>Email Address</label>
                                <input type="email" required value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group full-width">
                                <label>Temporary Password</label>
                                <input type="password" required value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" required value={userFormData.first_name} onChange={e => setUserFormData({ ...userFormData, first_name: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" required value={userFormData.last_name} onChange={e => setUserFormData({ ...userFormData, last_name: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group full-width">
                                <label>System Role</label>
                                <select value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value })} className="form-input">
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div className="modal-actions full-width">
                                <button type="button" className="btn btn-outline" onClick={() => setShowUserForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card list-card">
                <div className="list-toolbar">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder={activeTab === 'employees' ? "Search by ID, Name or Designation..." : "Search by Name or Email..."}
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="standard-table">
                        <thead>
                            {activeTab === 'employees' ? (
                                <tr>
                                    <th>Profile</th>
                                    <th>Emp ID</th>
                                    <th>Designation</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>User Account</th>
                                    <th>Email</th>
                                    <th>System Roles</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                            ) : activeTab === 'employees' ? (
                                filteredEmployees.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-4 text-gray-500">No employees found.</td></tr>
                                ) : (
                                    filteredEmployees.map(emp => (
                                        <tr key={emp.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div className="emp-avatar">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{emp.employee_name || `User #${emp.user}`}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-medium text-gray-500">{emp.employee_id}</td>
                                            <td>{emp.designation}</td>
                                            <td>{emp.phone}</td>
                                            <td>
                                                <span className={`status-badge ${emp.status}`}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td className="text-right action-cells">
                                                <button className="icon-action-btn edit" onClick={() => handleEdit(emp)}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="icon-action-btn delete" onClick={() => handleDelete(emp.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                filteredUsers.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-4 text-gray-500">No users found.</td></tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div className="emp-avatar">
                                                        <Shield size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{user.first_name} {user.last_name}</div>
                                                        <div className="user-id-subtext">ID: #{user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="user-email-cell">{user.email}</td>
                                            <td>
                                                <div className="user-badges-container">
                                                    {user.groups?.map(g => (
                                                        <span key={g} className={`user-badge ${g.toLowerCase() === 'admin' ? 'user-badge-admin' : 'user-badge-role'}`}>
                                                            {g}
                                                        </span>
                                                    ))}
                                                    {user.is_staff && (
                                                        <span className="user-badge user-badge-staff">
                                                            Staff
                                                        </span>
                                                    )}
                                                    {user.has_employee_profile || employees.some(emp => emp.user === user.id) ? (
                                                        <span className="user-badge user-badge-linked">
                                                            Profile Linked
                                                        </span>
                                                    ) : (
                                                        <span className="user-badge user-badge-unlinked">
                                                            No Profile
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Employees;
