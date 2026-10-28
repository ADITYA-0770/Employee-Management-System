import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import api from '../../services/api';
import '../departments/Departments.css';
import './Attendance.css';

const MyAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [overallTime, setOverallTime] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('attendance/history/');
                setAttendance(res.data.attendance || []);
                setOverallTime(res.data.overall_total_working_time || "");
            } catch (err) {
                console.error('Failed to fetch attendance history', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    const formatServerTime = (timeString) => {
        if (!timeString) return "--:--";
        if (timeString.includes('T')) {
            const date = new Date(timeString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return timeString.substring(0, 5); 
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>My Attendance</h1>
                    <p>View your past attendance records and hours worked</p>
                </div>
            </div>

            <div className="card list-card">
                <div className="list-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#374151' }}>Attendance History</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: '#0369a1', fontWeight: '600' }}>
                        <Clock size={16} />
                        Total Hours: {overallTime || "00:00:00"}
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="standard-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>First Check In</th>
                                <th>Last Check Out</th>
                                <th>Total Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                            ) : attendance.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 text-gray-500">No attendance records found.</td></tr>
                            ) : (
                                attendance.map(record => {
                                    const firstSession = record.sessions?.[0];
                                    const lastSession = record.sessions?.[record.sessions.length - 1];
                                    
                                    return (
                                        <tr key={record.id}>
                                            <td className="font-medium">{record.date}</td>
                                            <td>{formatServerTime(firstSession?.checkin_time)}</td>
                                            <td>{formatServerTime(lastSession?.checkout_time)}</td>
                                            <td className="font-medium" style={{color: '#374151'}}>
                                                {record.total_working_time ? record.total_working_time.substring(0, 8) : "--:--:--"}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${record.status?.toLowerCase() === 'present' ? 'approved' : 'pending'}`}>
                                                    {record.status}
                                                </span>
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

export default MyAttendance;
