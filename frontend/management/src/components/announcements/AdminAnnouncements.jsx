import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { parseError } from '../../utils/errorHandler';
import '../departments/Departments.css';

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        publish_at: '',
        expires_at: '',
        status: 'published'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('announcements/');
            let dataToSet = res.data?.data || res.data?.results || res.data || [];
            if (!Array.isArray(dataToSet)) {
                dataToSet = [];
            }
            setAnnouncements(dataToSet);
        } catch (err) {
            if (err.response?.status === 404) {
                setAnnouncements([]);
            } else {
                console.error('Failed to fetch announcements', err);
                toast.error('Failed to load announcements');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (ann) => {
        setFormData({
            title: ann.title || '',
            description: ann.description || '',
            publish_at: ann.publish_at?.split('T')[0] || '',
            expires_at: ann.expires_at?.split('T')[0] || '',
            status: ann.status || 'published'
        });
        setEditId(ann.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await api.delete(`announcements/${id}/`);
            toast.success('Announcement deleted successfully');
            fetchData();
        } catch (err) {
            toast.error(parseError(err));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.expires_at) delete payload.expires_at;

            if (editId) {
                await api.patch(`announcements/${editId}/`, payload);
                toast.success('Announcement updated successfully');
            } else {
                await api.post('announcements/create/', payload);
                toast.success('Announcement created successfully');
            }
            setShowForm(false);
            setEditId(null);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(parseError(err));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Manage Announcements</h1>
                    <p>Create and edit company-wide announcements</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setEditId(null);
                    setFormData({ title: '', description: '', publish_at: '', expires_at: '', status: 'published' });
                    setShowForm(true);
                }}>
                    <Plus size={18} /> New Announcement
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editId ? 'Edit Announcement' : 'New Announcement'}</h2>
                            <button className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="standard-form">
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Publish Date</label>
                                <input type="date" required value={formData.publish_at} onClick={(e) => { try { e.target.showPicker(); } catch {} }} onChange={e => setFormData({ ...formData, publish_at: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Expiry Date (Optional)</label>
                                <input type="date" value={formData.expires_at} onClick={(e) => { try { e.target.showPicker(); } catch {} }} onChange={e => setFormData({ ...formData, expires_at: e.target.value })} className="form-input" />
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-input">
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="form-input" rows="4"></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Announcement</button>
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
                                <th>Title</th>
                                <th>Publish Date</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                            ) : announcements.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 text-gray-500">No announcements found.</td></tr>
                            ) : (
                                announcements.map(ann => (
                                    <tr key={ann.id}>
                                        <td className="font-medium">{ann.title}</td>
                                        <td>{formatDate(ann.publish_at)}</td>
                                        <td>{formatDate(ann.expires_at)}</td>
                                        <td>
                                            <span className={`status-badge ${ann.status === 'published' ? 'approved' : 'pending'}`}>
                                                {ann.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="text-right action-cells">
                                            <button className="icon-action-btn edit" onClick={() => handleEdit(ann)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="icon-action-btn delete" onClick={() => handleDelete(ann.id)}>
                                                <Trash2 size={16} />
                                            </button>
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

export default AdminAnnouncements;
