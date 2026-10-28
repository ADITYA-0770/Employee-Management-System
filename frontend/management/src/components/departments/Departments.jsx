import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import api from '../../services/api';
import './Departments.css';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('departments/');
            setDepartments(res.data.results || res.data || []);
        } catch (err) {
            console.error('Failed to fetch departments', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const filteredDepts = departments.filter(d =>
        d.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (dept) => {
        setFormData({ name: dept.name, description: dept.description || '' });
        setEditId(dept.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await api.delete(`departments/${id}/`);
            fetchDepartments();
        } catch (err) {
            alert('Failed to delete department');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`departments/${editId}/`, formData);
            } else {
                await api.post('departments/create/', formData);
            }
            setShowForm(false);
            setFormData({ name: '', description: '' });
            setEditId(null);
            fetchDepartments();
        } catch (err) {
            console.error(err);
            alert('Failed to save department');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Departments</h1>
                    <p>Manage company departments and structural units</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setFormData({ name: '', description: '' });
                    setEditId(null);
                    setShowForm(true);
                }}>
                    <Plus size={18} /> New Department
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editId ? 'Edit Department' : 'Add Department'}</h2>
                            <button className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="standard-form">
                            <div className="form-group">
                                <label>Department Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="form-input"
                                    placeholder="e.g. Engineering"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="form-input"
                                    rows="4"
                                    placeholder="Brief description..."
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Department</button>
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
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="standard-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr>
                            ) : filteredDepts.length === 0 ? (
                                <tr><td colSpan="3" className="text-center py-4 text-gray-500">No departments found.</td></tr>
                            ) : (
                                filteredDepts.map(dept => (
                                    <tr key={dept.id}>
                                        <td className="font-medium">{dept.name}</td>
                                        <td className="text-gray-500">{dept.description || '-'}</td>
                                        <td className="text-right action-cells">
                                            <button className="icon-action-btn edit" onClick={() => handleEdit(dept)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="icon-action-btn delete" onClick={() => handleDelete(dept.id)}>
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

export default Departments;
