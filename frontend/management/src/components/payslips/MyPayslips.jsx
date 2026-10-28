import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import api from '../../services/api';
import '../departments/Departments.css';

const MyPayslips = () => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayslips = async () => {
            try {
                const res = await api.get('payslips/');
                setPayslips(res.data.results || res.data || []);
            } catch (err) {
                console.error('Failed to fetch payslips', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPayslips();
    }, []);

    const handleDownload = async (id) => {
        try {
            // Using window.open or fetching blob depends on if the API requires auth header for the PDF view
            // The simplest way if it requires auth is to fetch it as a blob
            const res = await api.get(`payslips/${id}/pdf/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslip_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            alert('Failed to download payslip. Ensure the PDF generation library is installed on the backend.');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>My Payslips</h1>
                    <p>View and download your monthly salary slips</p>
                </div>
            </div>

            <div className="card list-card">
                <div className="table-responsive">
                    <table className="standard-table">
                        <thead>
                            <tr>
                                <th>Month/Year</th>
                                <th>Basic Salary</th>
                                <th>Allowances</th>
                                <th>Deductions</th>
                                <th>Net Pay</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                            ) : payslips.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-gray-500">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem 0' }}>
                                            <FileText size={32} color="#9ca3af" />
                                            <span>No payslips generated yet.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payslips.map(ps => (
                                    <tr key={ps.id}>
                                        <td className="font-medium">{ps.month} {ps.year}</td>
                                        <td>${parseFloat(ps.basic_salary).toFixed(2)}</td>
                                        <td style={{ color: '#16a34a' }}>+${parseFloat(ps.allowances || 0).toFixed(2)}</td>
                                        <td style={{ color: '#dc2626' }}>-${parseFloat(ps.deductions || 0).toFixed(2)}</td>
                                        <td className="font-medium" style={{ color: '#374151' }}>${parseFloat(ps.net_salary).toFixed(2)}</td>
                                        <td className="text-right action-cells">
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                                                onClick={() => handleDownload(ps.id)}
                                            >
                                                <Download size={14} /> PDF
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

export default MyPayslips;
