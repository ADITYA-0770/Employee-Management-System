import React, { useState, useEffect } from 'react';
import { 
    CheckCircle, 
    XCircle, 
    Search, 
    Plus, 
    Edit2, 
    Trash2, 
    Receipt, 
    Tag, 
    Clock, 
    DollarSign,
    ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { parseError } from '../../utils/errorHandler';
import '../departments/Departments.css';
import './Expenses.css';

const AdminExpenses = () => {
    const [activeTab, setActiveTab] = useState('claims'); // 'claims' or 'categories'
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search filters
    const [claimSearch, setClaimSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');

    // Category Modal Form State
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [submittingCategory, setSubmittingCategory] = useState(false);

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
            console.error('Failed to fetch expenses or categories', err);
            toast.error('Failed to load expense data');
        } finally {
            setLoading(false);
        }
    };

    // Update claim status (Approve / Reject)
    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`expenses/status/${id}/`, { status: newStatus });
            toast.success(`Expense claim ${newStatus} successfully`);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(parseError(err));
        }
    };

    // Open Category Modal (Add or Edit)
    const handleOpenCategoryModal = (cat = null) => {
        if (cat) {
            setEditingCategoryId(cat.id);
            setCategoryForm({
                name: cat.name || '',
                description: cat.description || ''
            });
        } else {
            setEditingCategoryId(null);
            setCategoryForm({ name: '', description: '' });
        }
        setShowCategoryModal(true);
    };

    // Save Category (Create or Update)
    const handleSaveCategory = async (e) => {
        e.preventDefault();
        setSubmittingCategory(true);
        try {
            if (editingCategoryId) {
                await api.patch(`expenses/category/update/${editingCategoryId}/`, categoryForm);
                toast.success('Category updated successfully');
            } else {
                await api.post('expenses/category/create/', categoryForm);
                toast.success('Category created successfully');
            }
            setShowCategoryModal(false);
            setCategoryForm({ name: '', description: '' });
            setEditingCategoryId(null);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(parseError(err));
        } finally {
            setSubmittingCategory(false);
        }
    };

    // Delete Category
    const handleDeleteCategory = async (cat) => {
        const associatedCount = expenses.filter(exp => exp.category === cat.id).length;
        const confirmMsg = associatedCount > 0
            ? `Category "${cat.name}" is used in ${associatedCount} expense claims. Deleting it will unlink those claims. Are you sure?`
            : `Are you sure you want to delete category "${cat.name}"?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            await api.delete(`expenses/category/update/${cat.id}/`);
            toast.success('Category deleted successfully');
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(parseError(err));
        }
    };

    // Filter calculations
    const pendingCount = expenses.filter(exp => exp.status?.toLowerCase() === 'pending').length;
    const totalApprovedAmount = expenses
        .filter(exp => exp.status?.toLowerCase() === 'approved')
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    const filteredExpenses = expenses.filter(exp => {
        const empName = exp.employee_name || `Employee #${exp.employee}`;
        const catName = categories.find(c => c.id === exp.category)?.name || '';
        const search = claimSearch.toLowerCase();
        return empName.toLowerCase().includes(search) || catName.toLowerCase().includes(search);
    });

    const filteredCategories = categories.filter(cat => {
        const search = categorySearch.toLowerCase();
        return cat.name?.toLowerCase().includes(search) || cat.description?.toLowerCase().includes(search);
    });

    return (
        <div className="page-container">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Manage Expenses & Categories</h1>
                    <p>Oversee company reimbursements, claims approval, and expense categories</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => handleOpenCategoryModal()}
                    >
                        <Plus size={18} /> New Category
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="expenses-stats-grid">
                <div className="stat-metric-card">
                    <div className="stat-icon-wrapper amber">
                        <Clock size={24} />
                    </div>
                    <div className="stat-info-content">
                        <h4>Pending Claims</h4>
                        <p>{pendingCount}</p>
                    </div>
                </div>

                <div className="stat-metric-card">
                    <div className="stat-icon-wrapper emerald">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-info-content">
                        <h4>Approved Total</h4>
                        <p>${totalApprovedAmount.toFixed(2)}</p>
                    </div>
                </div>

                <div className="stat-metric-card">
                    <div className="stat-icon-wrapper purple">
                        <Tag size={24} />
                    </div>
                    <div className="stat-info-content">
                        <h4>Expense Categories</h4>
                        <p>{categories.length}</p>
                    </div>
                </div>

                <div className="stat-metric-card">
                    <div className="stat-icon-wrapper">
                        <Receipt size={24} />
                    </div>
                    <div className="stat-info-content">
                        <h4>Total Claims</h4>
                        <p>{expenses.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="expenses-tabs-nav">
                <button
                    className={`expenses-tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
                    onClick={() => setActiveTab('claims')}
                >
                    <Receipt size={18} />
                    Expense Claims
                    <span className="tab-count-badge">{expenses.length}</span>
                </button>
                <button
                    className={`expenses-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                    onClick={() => setActiveTab('categories')}
                >
                    <Tag size={18} />
                    Expense Categories
                    <span className="tab-count-badge">{categories.length}</span>
                </button>
            </div>

            {/* TAB 1: CLAIMS REVIEW */}
            {activeTab === 'claims' && (
                <div className="card list-card">
                    <div className="list-toolbar">
                        <div className="search-bar">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Filter by employee or category..."
                                className="search-input"
                                value={claimSearch}
                                onChange={(e) => setClaimSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="standard-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Employee</th>
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
                                    <tr><td colSpan="8" className="text-center py-4">Loading claims...</td></tr>
                                ) : filteredExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-gray-500">
                                            No expense claims match your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredExpenses.map(exp => {
                                        const cat = categories.find(c => c.id === exp.category);
                                        return (
                                            <tr key={exp.id}>
                                                <td>{exp.expense_date}</td>
                                                <td className="font-medium">
                                                    {exp.employee_name || `Employee #${exp.employee}`}
                                                </td>
                                                <td>
                                                    <span className="category-tag">
                                                        <Tag size={12} />
                                                        {cat ? cat.name : (exp.category ? `ID #${exp.category}` : 'Unassigned')}
                                                    </span>
                                                </td>
                                                <td className="font-medium" style={{ color: '#2dd4bf' }}>
                                                    ${parseFloat(exp.amount).toFixed(2)}
                                                </td>
                                                <td className="text-gray-500" style={{ maxWidth: '240px' }}>
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
                                                            style={{ display: 'inline-flex', padding: '0.35rem 0.6rem', fontSize: '0.8rem', gap: '0.3rem', textDecoration: 'none' }}
                                                        >
                                                            <ExternalLink size={14} /> Receipt
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
                                                        <>
                                                            <button
                                                                className="icon-action-btn edit"
                                                                onClick={() => handleUpdateStatus(exp.id, 'approved')}
                                                                title="Approve Claim"
                                                            >
                                                                <CheckCircle size={18} color="#16a34a" />
                                                            </button>
                                                            <button
                                                                className="icon-action-btn delete"
                                                                onClick={() => handleUpdateStatus(exp.id, 'rejected')}
                                                                title="Reject Claim"
                                                            >
                                                                <XCircle size={18} color="#dc2626" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-500" style={{ fontSize: '0.8rem' }}>
                                                            Processed
                                                        </span>
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
            )}

            {/* TAB 2: EXPENSE CATEGORIES MANAGEMENT */}
            {activeTab === 'categories' && (
                <div className="card list-card">
                    <div className="list-toolbar">
                        <div className="search-bar">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search categories by name or description..."
                                className="search-input"
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                            />
                        </div>
                        <div>
                            <button 
                                className="btn btn-primary"
                                onClick={() => handleOpenCategoryModal()}
                            >
                                <Plus size={16} /> Add Category
                            </button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="standard-table">
                            <thead>
                                <tr>
                                    <th>Category Name</th>
                                    <th>Description</th>
                                    <th>Active Claims</th>
                                    <th>Created On</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-4">Loading categories...</td></tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-500">
                                            {categorySearch ? (
                                                'No expense categories match your search.'
                                            ) : (
                                                <div>
                                                    <p style={{ margin: '0 0 1rem 0' }}>No expense categories have been created yet.</p>
                                                    <button 
                                                        className="btn btn-primary"
                                                        onClick={() => handleOpenCategoryModal()}
                                                    >
                                                        <Plus size={16} /> Create Your First Category
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map(cat => {
                                        const usageCount = expenses.filter(exp => exp.category === cat.id).length;
                                        return (
                                            <tr key={cat.id}>
                                                <td className="font-medium" style={{ color: '#ffffff' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Tag size={16} color="#2dd4bf" />
                                                        <span>{cat.name}</span>
                                                    </div>
                                                </td>
                                                <td className="text-gray-500" style={{ maxWidth: '350px' }}>
                                                    {cat.description || '—'}
                                                </td>
                                                <td>
                                                    <span className="category-usage-badge">
                                                        {usageCount} {usageCount === 1 ? 'claim' : 'claims'}
                                                    </span>
                                                </td>
                                                <td className="text-gray-500" style={{ fontSize: '0.85rem' }}>
                                                    {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="text-right action-cells">
                                                    <button
                                                        className="icon-action-btn edit"
                                                        onClick={() => handleOpenCategoryModal(cat)}
                                                        title="Edit Category"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="icon-action-btn delete"
                                                        onClick={() => handleDeleteCategory(cat)}
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ADD / EDIT CATEGORY MODAL */}
            {showCategoryModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingCategoryId ? 'Edit Expense Category' : 'Create Expense Category'}</h2>
                            <button 
                                className="close-btn" 
                                onClick={() => setShowCategoryModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="standard-form">
                            <div className="form-group">
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={100}
                                    placeholder="e.g. Travel & Lodging, Meals, Software Licenses"
                                    className="form-input"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group" style={{ marginTop: '1.25rem' }}>
                                <label>Description *</label>
                                <textarea
                                    required
                                    maxLength={200}
                                    rows="3"
                                    placeholder="Brief explanation of allowable claims under this category..."
                                    className="form-input"
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                />
                                <small style={{ color: '#64748b', marginTop: '0.25rem', textAlign: 'right' }}>
                                    {categoryForm.description.length}/200 characters
                                </small>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '1.75rem' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-outline" 
                                    onClick={() => setShowCategoryModal(false)}
                                    disabled={submittingCategory}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={submittingCategory}
                                >
                                    {submittingCategory ? 'Saving...' : (editingCategoryId ? 'Update Category' : 'Save Category')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminExpenses;
