import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { parseError } from '../../utils/errorHandler';
import '../departments/Departments.css';

const AdminExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`expenses/status/${id}/`, { status: newStatus });
            toast.success(`Expense ${newStatus} successfully`);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(parseError(err));
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Manage Expenses</h1>
                    <p>Review and approve employee expense claims</p>
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
                                <th>Date</th>
                                <th>Employee</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                            ) : (() => {
                                const filtered = expenses.filter(exp => {
                                    const empName = exp.employee_name || `Employee #${exp.employee}`;
                                    return String(empName).toLowerCase().includes(searchTerm.toLowerCase());
                                });

                                if (filtered.length === 0) {
                                    return <tr><td colSpan="7" className="text-center py-4 text-gray-500">No expenses found.</td></tr>;
                                }

                                return filtered.map(exp => (
                                    <tr key={exp.id}>
                                        <td>{exp.expense_date}</td>
                                        <td className="font-medium">{exp.employee_name || `Employee #${exp.employee}`}</td>
                                        <td className="font-medium">
                                            {categories.find(c => c.id === exp.category)?.name || `ID: ${exp.category}`}
                                        </td>
                                        <td className="font-medium" style={{ color: '#374151' }}>${parseFloat(exp.amount).toFixed(2)}</td>
                                        <td className="text-gray-500">{exp.description}</td>
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
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} color="#16a34a" />
                                                    </button>
                                                    <button
                                                        className="icon-action-btn delete"
                                                        onClick={() => handleUpdateStatus(exp.id, 'rejected')}
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

export default AdminExpenses;
