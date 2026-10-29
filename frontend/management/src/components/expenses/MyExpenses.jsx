import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, DollarSign, Clock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { parseError } from '../../utils/errorHandler';
import '../departments/Departments.css';
import './Expenses.css';

const MyExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        receipt: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expRes, catRes] = await Promise.all([
                api.get('expenses/'),
                api.get('expenses/category/')
            ]);
            setExpenses(expRes.data.results || expRes.data || []);
            setCategories(catRes.data.results || catRes.data || []);
        } catch (err) {
            console.error('Failed to fetch expenses', err);
            toast.error('Failed to load your expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this pending expense claim?')) return;
        try {
            await api.delete(`expenses/update/${id}/`);
            toast.success('Expense claim cancelled successfully');
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(parseError(err) || 'Failed to delete expense claim');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let payload;
            if (formData.receipt) {
                payload = new FormData();
                payload.append('category', formData.category);
                payload.append('amount', formData.amount);
                payload.append('description', formData.description);
                payload.append('expense_date', formData.expense_date);
                payload.append('receipt', formData.receipt);
            } else {
                payload = {
                    category: formData.category,
                    amount: formData.amount,
                    description: formData.description,
                    expense_date: formData.expense_date
                };
            }

            await api.post('expenses/create/', payload);
            toast.success('Expense claim submitted successfully');
            setShowForm(false);
            setFormData({
                category: '',
                amount: '',
                description: '',
                expense_date: new Date().toISOString().split('T')[0],
                receipt: null
            });
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(parseError(err) || 'Failed to submit expense claim');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate personal totals
    const pendingCount = expenses.filter(exp => exp.status?.toLowerCase() === 'pending').length;
    const approvedTotal = expenses
        .filter(exp => exp.status?.toLowerCase() === 'approved')
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>My Expenses</h1>
                    <p>Submit and track your company reimbursement claims</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} /> New Claim
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="expenses-stats-grid">
                <div className="stat-metric-card">
                    <div className="stat-icon-wrapper amber">
                        <Clock size={22} />
                    </div>
                    <div className="stat-info-content">
                        <h4>Pending Claims</h4>
                        <p>{pendingCount}</p>
                    </div>
                </div>

                <div className="stat-metric-card">
                    <div className="stat-icon-wrapper emerald">
                        <CheckCircle2 size={22} />
                    </div>
                    <div className="stat-info-content">
                        <h4>Reimbursed Total</h4>
                        <p>${approvedTotal.toFixed(2)}</p>
                    </div>
                </div>

                <div className="stat-metric-card">
                    <div className="stat-icon-wrapper">
                        <DollarSign size={22} />
                    </div>
                    <div className="stat-info-content">
                        <h4>Total Claims</h4>
                        <p>{expenses.length}</p>
                    </div>
                </div>
            </div>

            {/* Modal for Creating New Claim */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Submit Expense Claim</h2>
                            <button className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="standard-form">
                            {categories.length === 0 ? (
                                <div style={{ 
                                    background: 'rgba(239, 68, 68, 0.1)', 
                                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                                    borderRadius: '0.5rem', 
                                    padding: '1rem', 
                                    color: '#fca5a5',
                                    display: 'flex',
                                    gap: '0.65rem',
                                    alignItems: 'center',
                                    fontSize: '0.9rem',
                                    marginBottom: '1rem'
                                }}>
                                    <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                                    <span>No expense categories are available. Please ask an administrator to add categories first.</span>
                                </div>
                            ) : null}

                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="form-input"
                                    required
                                    disabled={categories.length === 0}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginTop: '1.25rem' }}>
                                <label>Amount ($) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="form-input"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group" style={{ marginTop: '1.25rem' }}>
                                <label>Date of Expense *</label>
                                <input
                                    type="date"
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                    value={formData.expense_date}
                                    onClick={(e) => { try { e.target.showPicker(); } catch {} }}
                                    onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group" style={{ marginTop: '1.25rem' }}>
                                <label>Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="form-input"
                                    rows="3"
                                    required
                                    maxLength={200}
                                    placeholder="Provide business justification (e.g., Client lunch with Acme Corp, Uber to airport)..."
                                ></textarea>
                            </div>

                            <div className="form-group" style={{ marginTop: '1.25rem' }}>
                                <label>Receipt Attachment (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={e => setFormData({ ...formData, receipt: e.target.files[0] })}
                                    className="form-input"
                                />
                            </div>

                            <div className="modal-actions" style={{ marginTop: '1.75rem' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-outline" 
                                    onClick={() => setShowForm(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={submitting || categories.length === 0}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Claim'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expenses Table */}
            <div className="card list-card">
                <div className="table-responsive">
                    <table className="standard-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Receipt</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-4">Loading claims...</td></tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-6 text-gray-500">
                                        No expense claims submitted yet. Click "+ New Claim" to get started.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map(exp => {
                                    const cat = categories.find(c => c.id === exp.category);
                                    return (
                                        <tr key={exp.id}>
                                            <td>{exp.expense_date}</td>
                                            <td className="font-medium">
                                                <span className="category-tag">
                                                    <Tag size={12} />
                                                    {cat ? cat.name : (exp.category ? `ID #${exp.category}` : 'Unassigned')}
                                                </span>
                                            </td>
                                            <td className="font-medium" style={{ color: '#2dd4bf' }}>
                                                ${parseFloat(exp.amount).toFixed(2)}
                                            </td>
                                            <td className="text-gray-500" style={{ maxWidth: '280px' }}>
                                                {exp.description}
                                            </td>
                                            <td>
                                                {exp.receipt ? (
                                                    <a 
                                                        href={exp.receipt} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="icon-action-btn edit" 
                                                        title="View Receipt"
                                                        style={{ display: 'inline-flex', padding: '0.3rem 0.55rem', fontSize: '0.8rem', gap: '0.25rem', textDecoration: 'none' }}
                                                    >
                                                        <ExternalLink size={13} /> View
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500" style={{ fontSize: '0.8rem' }}>None</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${exp.status?.toLowerCase()}`}>
                                                    {exp.status}
                                                </span>
                                            </td>
                                            <td className="text-right action-cells">
                                                {exp.status?.toLowerCase() === 'pending' ? (
                                                    <button 
                                                        className="icon-action-btn delete" 
                                                        onClick={() => handleDelete(exp.id)}
                                                        title="Cancel Claim"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-500" style={{ fontSize: '0.8rem' }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyExpenses;
