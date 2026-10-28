import React, { useState, useEffect } from 'react';
import { Clock, Search, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import '../departments/Departments.css';
import '../attendance/Attendance.css';

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // For manual correction modal
    const [showForm, setShowForm] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [newStatus, setNewStatus] = useState('Present');

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await api.get('attendance/admin/all/');
            const data = res.data.attendance || res.data.results || res.data;
            setAttendance(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch attendance', err);
            toast.error('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    const handleCorrection = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`attendance/admin/${selectedRecord.id}/correction/`, { status: newStatus });
            setShowForm(false);
            fetchAttendance();
            toast.success('Attendance status updated successfully');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || 'Failed to update attendance');
        }
    };

    const openCorrectionModal = (record) => {
        setSelectedRecord(record);
        setNewStatus(record.status || 'Present');
        setShowForm(true);
    };

    const formatServerTime = (timeString) => {
        if (!timeString) return "--:--";
        if (timeString.includes('T')) {
            const date = new Date(timeString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return timeString.substring(0, 5);
    };

    const getEmployeeName = (emp) => {
        if (!emp) return 'Unknown Employee';
        if (typeof emp === 'object') {
            return emp.name?.trim() || emp.email || emp.employee_id || `Employee #${emp.id}`;
        }
        return String(emp);
    };

    const getEmployeeCode = (emp) => {
        if (typeof emp === 'object' && emp !== null) {
            return emp.employee_id || `ID: #${emp.id}`;
        }
        return '';
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Manage Attendance</h1>
                    <p>Review organization-wide attendance records and make corrections</p>
                </div>
            </div>

            {showForm && selectedRecord && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Correct Attendance Status</h2>
                            <button className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCorrection} className="standard-form">
                            <p style={{ marginBottom: '1.25rem', color: '#cbd5e1', fontSize: '0.92rem' }}>
                                Updating status for <strong style={{ color: '#2dd4bf' }}>{getEmployeeName(selectedRecord.employee)}</strong> on <strong style={{ color: '#f1f5f9' }}>{selectedRecord.date}</strong>.
                            </p>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                    className="form-input"
                                    required
                                >
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">Leave</option>
                                    <option value="half day">Half Day</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card list-card">
                <div className="list-toolbar">
                    <div className="search-bar">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Filter by employee name or ID..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="standard-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Employee</th>
                                <th>Time In</th>
                                <th>Time Out</th>
                                <th>Total Hours</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                            ) : (() => {
                                const filtered = attendance.filter(record => {
                                    const empName = getEmployeeName(record.employee);
                                    const empCode = getEmployeeCode(record.employee);
                                    const query = searchTerm.toLowerCase();
                                    return empName.toLowerCase().includes(query) || empCode.toLowerCase().includes(query);
                                });

                                if (filtered.length === 0) {
                                    return <tr><td colSpan="7" className="text-center py-4 text-gray-500">No attendance records found.</td></tr>;
                                }

                                return filtered.map(record => {
                                    const firstSession = record.sessions?.[0];
                                    const lastSession = record.sessions?.[record.sessions.length - 1];

                                    return (
                                        <tr key={record.id}>
                                            <td className="font-medium">{record.date}</td>
                                            <td className="font-medium">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div className="emp-avatar">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{getEmployeeName(record.employee)}</div>
                                                        {getEmployeeCode(record.employee) && (
                                                            <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                                                                {getEmployeeCode(record.employee)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{formatServerTime(firstSession?.checkin_time)}</td>
                                            <td>{formatServerTime(lastSession?.checkout_time)}</td>
                                            <td style={{ color: '#5eead4', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
                                                {record.total_working_time ? record.total_working_time.substring(0, 8) : "--:--:--"}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${record.status?.toLowerCase() === 'present' ? 'active' : 'inactive'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="text-right action-cells">
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                                                    onClick={() => openCorrectionModal(record)}
                                                >
                                                    Correction
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAttendance;
