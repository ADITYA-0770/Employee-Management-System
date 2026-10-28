import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import '../departments/Departments.css';
import './Leaves.css';

const MyLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        leave_type: 'paid',
        start_date: '',
        end_date: '',
        reason: ''
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await api.get('leaves/');
            setLeaves(res.data.results || res.data || []);
        } catch (err) {
            console.error('Failed to fetch leaves', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this leave request?')) return;
        try {
            await api.delete(`leaves/${id}/`);
            fetchLeaves();
        } catch (err) {
            alert('Failed to delete leave request');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('leaves/apply/', formData);
            setShowForm(false);
            setFormData({ leave_type: 'paid', start_date: '', end_date: '', reason: '' });
            fetchLeaves();
            alert('Leave requested successfully');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || 'Failed to submit leave request');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>My Leaves</h1>
                    <p>Request time off and view your leave history</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} /> Apply Leave
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Apply for Leave</h2>
                            <button className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="standard-form">
                            <div className="form-group">
                                <label>Leave Type</label>
                                <select
                                    value={formData.leave_type}
                                    onChange={e => setFormData({ ...formData, leave_type: e.target.value })}
                                    className="form-input"
                                    required
                                >
                                    <option value="paid">Paid Leave</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="unpaid">Unpaid Leave</option>
                                    <option value="half_day">Half Day</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onClick={(e) => { try { e.target.showPicker(); } catch {} }}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.end_date}
                                    onClick={(e) => { try { e.target.showPicker(); } catch {} }}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Reason</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    className="form-input"
                                    rows="3"
                                    required
                                    placeholder="Please provide a brief reason..."
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card list-card">
                <div className="table-responsive">
                    <table className="standard-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                            ) : leaves.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 text-gray-500">No leave requests found.</td></tr>
                            ) : (
                                leaves.map(leave => (
                                    <tr key={leave.id}>
                                        <td className="font-medium capitalize">{leave.leave_type.replace('_', ' ')}</td>
                                        <td>{leave.start_date} to {leave.end_date}</td>
                                        <td className="text-gray-500">{leave.reason}</td>
                                        <td>
                                            <span className={`status-badge ${leave.status.toLowerCase()}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="text-right action-cells">
                                            {leave.status.toLowerCase() === 'pending' && (
                                                <button className="icon-action-btn delete" onClick={() => handleDelete(leave.id)} title="Delete Request">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyLeaves;
