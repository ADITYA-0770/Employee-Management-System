import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";
import { Users, Clock, Calendar, DollarSign, Bell, CheckCircle, ArrowRight } from "lucide-react";
import api from "../../services/api";

function EmployeeDashboard() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    const [profile, setProfile] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [
                profileRes,
                attendanceRes,
                leavesRes,
                expensesRes,
                announcementsRes
            ] = await Promise.all([
                api.get("accounts/profile/"),
                api.get("attendance/today/").catch(() => ({ data: null })),
                api.get("leaves/"),
                api.get("expenses/"),
                api.get("announcements/")
            ]);

            setProfile(profileRes.data);

            if (attendanceRes.data && attendanceRes.data.attendance && attendanceRes.data.attendance.length > 0) {
                const todayAtt = attendanceRes.data.attendance[0];
                const activeSession = todayAtt.sessions?.find(s => !s.checkout_time);
                const firstSession = todayAtt.sessions?.[0];
                const lastSession = todayAtt.sessions?.[todayAtt.sessions.length - 1];
                setAttendance({
                    record: todayAtt,
                    activeSession: activeSession,
                    firstSession: firstSession,
                    lastSession: lastSession,
                    isCheckedIn: !!activeSession,
                    hasCheckedOut: !!lastSession && !activeSession
                });
            } else {
                setAttendance({ isCheckedIn: false, hasCheckedOut: false });
            }

            const ensureArray = (data) => {
                if (Array.isArray(data)) return data;
                if (data && Array.isArray(data.data)) return data.data;
                if (data && Array.isArray(data.results)) return data.results;
                return [];
            };

            setLeaves(ensureArray(leavesRes.data));
            setExpenses(ensureArray(expensesRes.data));
            setAnnouncements(ensureArray(announcementsRes.data));

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleCheckIn = async () => {
        try {
            await api.post("attendance/checkin/");
            alert("Checked in successfully!");
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.response?.data?.detail || "Failed to check in.");
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.post("attendance/checkout/");
            alert("Checked out successfully!");
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.response?.data?.detail || "Failed to check out.");
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatServerTime = (timeString) => {
        if (!timeString) return "--:--";
        if (timeString.includes('T')) {
            const date = new Date(timeString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return timeString.substring(0, 5);
    }

    if (loading) {
        return <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2>Loading dashboard...</h2></div>;
    }

    const isCheckedIn = attendance?.isCheckedIn;
    const hasCheckedOut = attendance?.hasCheckedOut;

    const getLeaveDays = (type) => {
        return leaves
            .filter(l => (l.status === 'approved' || l.status === 'Approved') && (l.leave_type === type || l.leave_type.toLowerCase() === type))
            .reduce((total, l) => {
                if (!l.start_date || !l.end_date) return total;
                const start = new Date(l.start_date);
                const end = new Date(l.end_date);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return total + diffDays;
            }, 0);
    };

    const annualLeave = getLeaveDays('paid');
    const sickLeave = getLeaveDays('sick');

    const pendingExpenses = expenses.filter(e => e.status === 'Pending' || e.status === 'pending');
    const pendingAmount = pendingExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    const reimbursedExpenses = expenses.filter(e => e.status === 'Approved' || e.status === 'approved' || e.status === 'reimbursed' || e.status === 'Reimbursed');
    const reimbursedAmount = reimbursedExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    // Live Attendance Calculation
    let totalMs = 0;
    if (attendance?.record?.sessions) {
        attendance.record.sessions.forEach(s => {
            if (s.checkout_time) {
                totalMs += (new Date(s.checkout_time) - new Date(s.checkin_time));
            } else if (s.checkin_time) {
                totalMs += (currentTime - new Date(s.checkin_time));
            }
        });
    }

    let liveHours = "--:--:--";
    let livePercent = 0;
    if (totalMs > 0) {
        const h = Math.floor(totalMs / 3600000);
        const m = Math.floor((totalMs % 3600000) / 60000);
        const sec = Math.floor((totalMs % 60000) / 1000);
        liveHours = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        livePercent = Math.min((totalMs / (8 * 3600000)) * 100, 100);
    }

    const firstSession = attendance?.record?.sessions?.[0];
    const lastSession = attendance?.record?.sessions?.[attendance.record.sessions.length - 1];
    const activeSession = attendance?.record?.sessions?.find(s => !s.checkout_time);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome back, {profile?.first_name || profile?.user?.first_name || profile?.username || "Employee"}!</h1>
                <p>Here's what's happening today.</p>
            </div>

            <div className="dashboard-grid">

                {/* Check In / Out Card */}
                <div className="card action-card">
                    <div className="card-header">
                        <div className="card-icon blue"><Clock size={20} /></div>
                        <h2 className="card-title">Time Clock</h2>
                    </div>
                    <div className="time-display">
                        <div className="time-current">{formatTime(currentTime)}</div>
                        <div className="time-date">{formatDate(currentTime)}</div>
                    </div>
                    <div className="action-buttons">
                        {!activeSession ? (
                            <button className="btn btn-primary" onClick={handleCheckIn}>
                                <CheckCircle size={16} /> Check In
                            </button>
                        ) : (
                            <button className="btn btn-primary" style={{ backgroundColor: '#ea580c' }} onClick={handleCheckOut}>
                                <CheckCircle size={16} /> Check Out
                            </button>
                        )}
                    </div>
                </div>

                {/* Today's Attendance */}
                <div className="card attendance-card">
                    <div className="card-header">
                        <div className="card-icon green"><Users size={20} /></div>
                        <h2 className="card-title">Today's Attendance</h2>
                    </div>
                    <div className="attendance-stats">
                        <div className="stat-box">
                            <span className="stat-value">{firstSession?.checkin_time ? formatServerTime(firstSession.checkin_time) : "--:--"}</span>
                            <span className="stat-label">Time In</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-value">{lastSession?.checkout_time && !activeSession ? formatServerTime(lastSession.checkout_time) : "--:--"}</span>
                            <span className="stat-label">Time Out</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-value">
                                {liveHours}
                            </span>
                            <span className="stat-label">Total Hours</span>
                        </div>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${livePercent}%` }}></div>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>
                        {Math.round(livePercent)}% of shift completed
                    </p>
                </div>

                {/* Leave Summary */}
                <div className="card leave-card">
                    <div className="card-header">
                        <div className="card-icon purple"><Calendar size={20} /></div>
                        <h2 className="card-title">Leave Summary</h2>
                    </div>
                    <div className="summary-list">
                        <div className="summary-item">
                            <div className="summary-item-left">
                                <span className="summary-item-title">Annual Leave</span>
                                <span className="summary-item-desc">Taken</span>
                            </div>
                            <span className="summary-item-value">{annualLeave} Days</span>
                        </div>
                        <div className="summary-item">
                            <div className="summary-item-left">
                                <span className="summary-item-title">Sick Leave</span>
                                <span className="summary-item-desc">Taken</span>
                            </div>
                            <span className="summary-item-value">{sickLeave} Days</span>
                        </div>
                        <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => navigate('/leaves')}>
                            Apply for Leave <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Expense Summary */}
                <div className="card expense-card">
                    <div className="card-header">
                        <div className="card-icon orange"><DollarSign size={20} /></div>
                        <h2 className="card-title">Expense Summary</h2>
                    </div>
                    <div className="summary-list">
                        <div className="summary-item">
                            <div className="summary-item-left">
                                <span className="summary-item-title">Pending Approval</span>
                                <span className="summary-item-desc">{pendingExpenses.length} requests</span>
                            </div>
                            <span className="summary-item-value" style={{ color: '#ea580c' }}>${pendingAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-item">
                            <div className="summary-item-left">
                                <span className="summary-item-title">Reimbursed</span>
                                <span className="summary-item-desc">{reimbursedExpenses.length} requests</span>
                            </div>
                            <span className="summary-item-value" style={{ color: '#16a34a' }}>${reimbursedAmount.toFixed(2)}</span>
                        </div>
                        <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => navigate('/expenses')}>
                            New Expense <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Latest Announcements */}
                <div className="card announcement-card">
                    <div className="card-header">
                        <div className="card-icon red"><Bell size={20} /></div>
                        <h2 className="card-title">Latest Announcements</h2>
                    </div>
                    <div className="announcement-list">
                        {announcements.length === 0 ? (
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No announcements at this time.</p>
                        ) : announcements.slice(0, 3).map((ann, idx) => (
                            <div className="announcement-item" key={idx}>
                                <div className="announcement-content">
                                    <h4>{ann.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default EmployeeDashboard;