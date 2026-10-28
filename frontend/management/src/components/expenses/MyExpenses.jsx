import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import '../departments/Departments.css';

const MyExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: '',
        expense_date: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [expRes, catRes] = await Promise.all([
                api.get('expenses/'),
                api.get('expenses/category/')
            ]);
            setExpenses(expRes.data.results || expRes.data || []);
            setCategories(catRes.data.results || catRes.data || []);
        } catch (err) {
            console.error('Failed to fetch expenses', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense claim?')) return;
        // The backend might not have a delete endpoint based on urls.py, but we'll try or just show error.
        try {
            await api.delete(`expenses/update/${id}/`); // Assumes DELETE is allowed on update view, common in DRF Generic Views
            fetchData();
        } catch (err) {
            alert('Failed to delete expense claim. It might be locked or unsupported.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('expenses/create/', formData);
            setShowForm(false);
            setFormData({ category: '', amount: '', description: '', expense_date: '' });
            fetchData();
            alert('Expense claim submitted successfully');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || 'Failed to submit expense claim');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>My Expenses</h1>
                    <p>Submit and track your reimbursement claims</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} /> New Claim
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Submit Expense Claim</h2>
                            <button className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="standard-form">
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="form-input"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Date of Expense</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.expense_date}
                                    onClick={(e) => { try { e.target.showPicker(); } catch {} }}
                                    onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="form-input"
                                    rows="3"
                                    required
                                    placeholder="What was this expense for?"
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Claim</button>
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
                                <th>Date</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                            ) : expenses.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 text-gray-500">No expenses found.</td></tr>
                            ) : (
                                expenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td>{exp.expense_date}</td>
                                        <td className="font-medium">
                                            {categories.find(c => c.id === exp.category)?.name || `ID: ${exp.category}`}
                                        </td>
                                        <td className="font-medium" style={{ color: '#374151' }}>${parseFloat(exp.amount).toFixed(2)}</td>
                                        <td className="text-gray-500">{exp.description}</td>
                                        <td>
                                            <span className={`status-badge ${exp.status.toLowerCase()}`}>
                                                {exp.status}
                                            </span>
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

export default MyExpenses;
