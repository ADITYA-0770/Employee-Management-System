import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import api from '../../services/api';
import '../departments/Departments.css';
import '../leaves/Leaves.css';

const AdminLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await api.get('leaves/admin/');
            setLeaves(res.data.results || res.data || []);
        } catch (err) {
            console.error('Failed to fetch all leaves', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`leaves/admin/${id}/`, { status: newStatus });
            fetchLeaves();
            // Optional: alert('Leave status updated');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || 'Failed to update leave status');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Manage Leaves</h1>
                    <p>Review and approve employee leave requests</p>
                </div>
            </div>

            <div className="card list-card">
                <div className="list-toolbar">
                    <div className="search-bar">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Filter by employee name..."
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
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                            ) : (() => {
                                const getEmpDisplayName = (leave) => {
                                    if (leave.employee_name) return leave.employee_name;
                                    if (typeof leave.employee === 'object' && leave.employee !== null) {
                                        return leave.employee.name || leave.employee.employee_id || `Employee #${leave.employee.id}`;
                                    }
                                    return leave.employee ? `Employee #${leave.employee}` : 'Unknown';
                                };

                                const filtered = leaves.filter(leave => {
                                    const empName = getEmpDisplayName(leave);
                                    return String(empName).toLowerCase().includes(searchTerm.toLowerCase());
                                });

                                if (filtered.length === 0) {
                                    return <tr><td colSpan="6" className="text-center py-4 text-gray-500">No leave requests found.</td></tr>;
                                }

                                return filtered.map(leave => (
                                    <tr key={leave.id}>
                                        <td className="font-medium">{getEmpDisplayName(leave)}</td>
                                        <td className="font-medium capitalize">{leave.leave_type?.replace('_', ' ')}</td>
                                        <td>{leave.start_date} to {leave.end_date}</td>
                                        <td className="text-gray-500">{leave.reason}</td>
                                        <td>
                                            <span className={`status-badge ${leave.status?.toLowerCase()}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="text-right action-cells">
                                            {leave.status?.toLowerCase() === 'pending' ? (
                                                <>
                                                    <button
                                                        className="icon-action-btn edit"
                                                        onClick={() => handleUpdateStatus(leave.id, 'approved')}
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} color="#16a34a" />
                                                    </button>
                                                    <button
                                                        className="icon-action-btn delete"
                                                        onClick={() => handleUpdateStatus(leave.id, 'rejected')}
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} color="#dc2626" />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-gray-500" style={{ fontSize: '0.8rem' }}>Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLeaves;
