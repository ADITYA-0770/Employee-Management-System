import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    Clock, 
    Calendar, 
    FileText, 
    Receipt, 
    Bell, 
    Building2, 
    Shield, 
    CheckCircle2, 
    ChevronDown, 
    ChevronUp, 
    Search, 
    Sparkles, 
    ArrowRight, 
    Activity, 
    Lock, 
    Check, 
    DollarSign, 
    Play, 
    Download,
    X,
    TrendingUp,
    Layers,
    UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(0);
    const [activeDashboardTab, setActiveDashboardTab] = useState('overview');
    const [demoModalOpen, setDemoModalOpen] = useState(false);
    const [demoEmail, setDemoEmail] = useState('');
    const [token, setToken] = useState(null);

    // Interactive Widget States for EMS
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [clockTimer, setClockTimer] = useState("08:42:15");
    const [leaveApproved, setLeaveApproved] = useState(false);
    const [leaveRejected, setLeaveRejected] = useState(false);
    const [slipDownloaded, setSlipDownloaded] = useState(false);
    const [selectedRole, setSelectedRole] = useState('engineer');

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        setToken(storedToken);
    }, []);

    // Live clock simulation
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Interactive Salary Calculation breakdown by role
    const salaryRoles = {
        engineer: { role: 'Senior Software Engineer', basic: '$6,200', hra: '$1,400', tax: '-$620', net: '$6,980' },
        designer: { role: 'Product Designer', basic: '$5,400', hra: '$1,200', tax: '-$540', net: '$6,060' },
        manager: { role: 'Operations Manager', basic: '$7,000', hra: '$1,600', tax: '-$700', net: '$7,900' }
    };

    // Real EMS FAQs
    const faqs = [
        {
            question: "How does the Employee Management System track daily attendance and working hours?",
            answer: "EMS features sub-second web and mobile check-in/check-out timers. Employees can log multiple active sessions per day. The system automatically reconciles total working hours, calculates overtime thresholds, and compiles automated monthly attendance summaries for payroll."
        },
        {
            question: "Can employees apply for leaves and view real-time balances?",
            answer: "Yes! Employees have an interactive self-service leave portal to view their remaining Paid, Sick, and Casual leave allowances. When a leave application is submitted, managers receive instant notifications and can approve or reject requests with one click."
        },
        {
            question: "How does automated payslip generation and tax breakdown work?",
            answer: "Administrators and HR managers can generate monthly payroll records in batch. The platform dynamically calculates statutory deductions, housing allowances, bonuses, and unpaid leave penalties, automatically producing downloadable PDF payslips for each staff member."
        },
        {
            question: "Can employees submit expense claims and receipts for reimbursement?",
            answer: "Yes. Employees can submit reimbursement claims for travel, hardware, and client entertainment directly through the system. HR managers can inspect invoices, track audit trails, and approve payouts with zero paper delays."
        },
        {
            question: "How does role-based access control (RBAC) protect sensitive company records?",
            answer: "EMS strictly segregates employee privileges from administrative operations. Regular employees only access their personal dashboard, attendance logs, leaves, and salary slips, while administrators have dedicated modules to manage departments, staff rosters, and financial approvals."
        }
    ];

    const handleToggleClock = () => {
        setIsCheckedIn(!isCheckedIn);
        if (!isCheckedIn) {
            toast.success("Checked in successfully! Shift timer active.");
        } else {
            toast.success("Checked out successfully! Total session logged.");
        }
    };

    const handleApproveLeave = () => {
        setLeaveApproved(true);
        setLeaveRejected(false);
        toast.success("Leave Request Approved! Employee notified via email.");
    };

    const handleRejectLeave = () => {
        setLeaveRejected(true);
        setLeaveApproved(false);
        toast.error("Leave Request Rejected. Notification dispatched.");
    };

    const handleDownloadSlip = () => {
        setSlipDownloaded(true);
        toast.success(`Payslip for ${salaryRoles[selectedRole].role} generated & downloaded!`);
        setTimeout(() => setSlipDownloaded(false), 3000);
    };

    const handleBookDemoSubmit = (e) => {
        e.preventDefault();
        if (!demoEmail) {
            toast.error("Please enter your corporate email");
            return;
        }
        toast.success("Demo scheduled! Our enterprise HR consultant will reach out.");
        setDemoModalOpen(false);
        setDemoEmail('');
    };

    const navigateAuth = () => {
        if (token) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="landing-root">
            {/* Ambient Teal Lighting Beams & Glows matching EMS Theme */}
            <div className="ambient-beam"></div>
            <div className="ambient-radial"></div>

            {/* Top Navigation Header */}
            <header className="landing-header">
                <div className="landing-nav-container">
                    {/* Brand Logo & Name */}
                    <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="brand-cube-icon">
                            <Users size={20} className="brand-logo-icon" />
                        </div>
                        <div className="brand-text-group">
                            <span className="brand-title">EMPLOYEE MANAGEMENT SYSTEM</span>
                            <span className="brand-sub">ENTERPRISE WORKFORCE OS</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="desktop-nav">
                        <a href="#overview" className="nav-link">Overview</a>
                        <a href="#capabilities" className="nav-link">Modules</a>
                        <a href="#dashboard-preview" className="nav-link">HR Dashboard</a>
                        <a href="#faq" className="nav-link">FAQ</a>
                    </nav>

                    {/* Actions */}
                    <div className="nav-actions">
                        <button className="btn-signin" onClick={() => navigate('/login')}>
                            {token ? "Switch Account" : "Sign In"}
                        </button>
                        <button className="btn-getstarted" onClick={navigateAuth}>
                            {token ? "Enter Dashboard" : "Get Started"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section" id="overview">
                <div className="hero-content">
                    {/* Announcement Badge */}
                    <div className="hero-badge">
                        <span className="badge-dot"></span>
                        <span className="badge-text">SAY HELLO TO EMS V2.4 • WORKFORCE PLATFORM</span>
                    </div>

                    {/* Headline with Serif and Italic Accent */}
                    <h1 className="hero-headline">
                        Manage your enterprise workforce<br />
                        effortlessly <span className="headline-italic">and</span> hassle free
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle">
                        Automate employee records, smart attendance clocking, seamless leave approvals,
                        instant payslip generation, and audited expense claims from a single unified cloud dashboard.
                    </p>

                    {/* Hero Action Buttons */}
                    <div className="hero-actions">
                        <button className="btn-hero-primary" onClick={() => setDemoModalOpen(true)}>
                            Book a Free Demo
                        </button>
                        <button className="btn-hero-secondary" onClick={navigateAuth}>
                            {token ? "Access Dashboard Now" : "Launch Portal Now"}
                        </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="trust-strip">
                        <span>⭐ Trusted by 500+ High-Growth Enterprises</span>
                        <span className="strip-divider">•</span>
                        <span>Role-Based Access Control</span>
                        <span className="strip-divider">•</span>
                        <span>Statutory Tax & Audit Ready</span>
                    </div>
                </div>

                {/* Hero Dashboard Preview Window (macOS Chrome Window) */}
                <div className="dashboard-window-container" id="dashboard-preview">
                    <div className="dashboard-mac-window">
                        {/* macOS Window Top Chrome Bar */}
                        <div className="mac-window-bar">
                            <div className="mac-traffic-lights">
                                <span className="mac-dot mac-dot-red"></span>
                                <span className="mac-dot mac-dot-yellow"></span>
                                <span className="mac-dot mac-dot-green"></span>
                            </div>
                            <div className="mac-window-title">
                                EMPLOYEE MANAGEMENT SYSTEM // LIVE HR TELEMETRY
                            </div>
                            <div className="mac-window-status">
                                <span className="status-live-dot"></span>
                                <span className="status-live-text">ONLINE • LIVE HRMS</span>
                                <div className="admin-chip">
                                    <span className="admin-name">HR Admin</span>
                                    <span className="admin-avatar"></span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Sub-Navigation inside Mockup */}
                        <div className="mockup-subnav">
                            <div className="mockup-breadcrumbs">
                                <span>Home</span>
                                <span className="breadcrumb-arrow">›</span>
                                <span className="breadcrumb-active">Employee Dashboard</span>
                            </div>
                            <div className="mockup-search">
                                <Search size={14} className="search-icon" />
                                <input type="text" placeholder="Search employee, department, or ID..." readOnly />
                            </div>
                            <div className="mockup-tabs">
                                <button 
                                    className={`mockup-tab-btn ${activeDashboardTab === 'overview' ? 'active' : ''}`}
                                    onClick={() => setActiveDashboardTab('overview')}
                                >
                                    Overview
                                </button>
                                <button 
                                    className={`mockup-tab-btn ${activeDashboardTab === 'attendance' ? 'active' : ''}`}
                                    onClick={() => setActiveDashboardTab('attendance')}
                                >
                                    Live Punch Timer
                                </button>
                                <button 
                                    className={`mockup-tab-btn ${activeDashboardTab === 'payroll' ? 'active' : ''}`}
                                    onClick={() => setActiveDashboardTab('payroll')}
                                >
                                    Payroll Ledger
                                </button>
                            </div>
                        </div>

                        {/* Mockup Body Content */}
                        <div className="mockup-body">
                            {/* Left Side: Mockup Sidebar matching the real project */}
                            <div className="mockup-sidebar">
                                <div className="sidebar-group">
                                    <div className="sidebar-item active">
                                        <Layers size={16} />
                                        <span>Dashboard</span>
                                    </div>
                                    <div className="sidebar-item">
                                        <Clock size={16} />
                                        <span>Attendance</span>
                                    </div>
                                    <div className="sidebar-item">
                                        <Calendar size={16} />
                                        <span>Leaves</span>
                                    </div>
                                    <div className="sidebar-item">
                                        <Receipt size={16} />
                                        <span>Expenses</span>
                                    </div>
                                    <div className="sidebar-item">
                                        <FileText size={16} />
                                        <span>Payslips</span>
                                    </div>
                                    <div className="sidebar-item">
                                        <Bell size={16} />
                                        <span>Announcements</span>
                                    </div>
                                    <div className="sidebar-item">
                                        <Building2 size={16} />
                                        <span>Departments</span>
                                    </div>
                                    <div className="sidebar-item">
                                        <Users size={16} />
                                        <span>Employees</span>
                                    </div>
                                </div>
                            </div>

                            {/* Center: Dynamic Mockup Content */}
                            <div className="mockup-main">
                                {activeDashboardTab === 'overview' && (
                                    <>
                                        {/* Real EMS KPI Grid */}
                                        <div className="mockup-kpi-grid">
                                            <div className="kpi-card">
                                                <div className="kpi-top">
                                                    <span className="kpi-label">ACTIVE EMPLOYEES</span>
                                                    <Users size={14} className="kpi-icon" />
                                                </div>
                                                <div className="kpi-value">482</div>
                                                <div className="kpi-delta delta-up">▲ 100% Onboarded</div>
                                            </div>

                                            <div className="kpi-card">
                                                <div className="kpi-top">
                                                    <span className="kpi-label">TODAY ATTENDANCE</span>
                                                    <Clock size={14} className="kpi-icon" />
                                                </div>
                                                <div className="kpi-value">96.8%</div>
                                                <div className="kpi-delta delta-up">▲ 468 Present Today</div>
                                            </div>

                                            <div className="kpi-card">
                                                <div className="kpi-top">
                                                    <span className="kpi-label">PENDING LEAVES</span>
                                                    <Calendar size={14} className="kpi-icon" />
                                                </div>
                                                <div className="kpi-value">4</div>
                                                <div className="kpi-delta delta-alert">▲ 4 Requests Pending</div>
                                            </div>

                                            <div className="kpi-card">
                                                <div className="kpi-top">
                                                    <span className="kpi-label">EXPENSE CLAIMS</span>
                                                    <Receipt size={14} className="kpi-icon" />
                                                </div>
                                                <div className="kpi-value">$12,450</div>
                                                <div className="kpi-delta delta-ok">▲ 18 Reimbursed</div>
                                            </div>

                                            <div className="kpi-card">
                                                <div className="kpi-top">
                                                    <span className="kpi-label">MONTHLY PAYROLL</span>
                                                    <DollarSign size={14} className="kpi-icon" />
                                                </div>
                                                <div className="kpi-value">$248,500</div>
                                                <div className="kpi-delta delta-up">▲ Disbursed & Audited</div>
                                            </div>

                                            <div className="kpi-card">
                                                <div className="kpi-top">
                                                    <span className="kpi-label">DEPARTMENTS</span>
                                                    <Building2 size={14} className="kpi-icon" />
                                                </div>
                                                <div className="kpi-value">8 Teams</div>
                                                <div className="kpi-delta delta-up">▲ Eng, Sales, Ops, HR</div>
                                            </div>
                                        </div>

                                        {/* Mockup Chart: Attendance & Workforce Flow */}
                                        <div className="mockup-chart-card">
                                            <div className="chart-header">
                                                <div>
                                                    <div className="chart-title">Department Attendance & Headcount Distribution</div>
                                                    <div className="chart-period">Current Month Telemetry • 8 Operational Departments</div>
                                                </div>
                                                <div className="chart-surplus">
                                                    <span className="surplus-label">TOTAL HOURS LOGGED</span>
                                                    <span className="surplus-value">38,420 hrs</span>
                                                </div>
                                            </div>
                                            <div className="chart-bars-container">
                                                <div className="chart-bar-group">
                                                    <div className="chart-bar bar-inc" style={{ height: '72%' }}></div>
                                                    <div className="chart-bar bar-exp" style={{ height: '28%' }}></div>
                                                    <span className="chart-label">Engineering</span>
                                                </div>
                                                <div className="chart-bar-group">
                                                    <div className="chart-bar bar-inc" style={{ height: '88%' }}></div>
                                                    <div className="chart-bar bar-exp" style={{ height: '22%' }}></div>
                                                    <span className="chart-label">Product</span>
                                                </div>
                                                <div className="chart-bar-group">
                                                    <div className="chart-bar bar-inc" style={{ height: '94%' }}></div>
                                                    <div className="chart-bar bar-exp" style={{ height: '18%' }}></div>
                                                    <span className="chart-label">Sales</span>
                                                </div>
                                                <div className="chart-bar-group">
                                                    <div className="chart-bar bar-inc" style={{ height: '80%' }}></div>
                                                    <div className="chart-bar bar-exp" style={{ height: '30%' }}></div>
                                                    <span className="chart-label">HR & Admin</span>
                                                </div>
                                                <div className="chart-bar-group">
                                                    <div className="chart-bar bar-inc" style={{ height: '86%' }}></div>
                                                    <div className="chart-bar bar-exp" style={{ height: '24%' }}></div>
                                                    <span className="chart-label">Finance</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeDashboardTab === 'attendance' && (
                                    <div className="mockup-tab-content">
                                        <div className="telemetry-box">
                                            <div className="telemetry-header">
                                                <span>LIVE EMPLOYEE ATTENDANCE PUNCH CLOCK</span>
                                                <span className="live-badge">SYSTEM CLOCK: {currentDateTime.toLocaleTimeString()}</span>
                                            </div>
                                            <div className="interactive-punch-banner">
                                                <div className="punch-status-indicator">
                                                    <span className={`status-circle ${isCheckedIn ? 'active' : ''}`}></span>
                                                    <span>Status: {isCheckedIn ? "CURRENTLY CHECKED IN" : "CURRENTLY CHECKED OUT"}</span>
                                                </div>
                                                <div className="punch-timer-display">
                                                    Session Time: {isCheckedIn ? "08:42:15" : "00:00:00"}
                                                </div>
                                                <button 
                                                    className={`simulate-punch-btn ${isCheckedIn ? 'btn-checkout' : 'btn-checkin'}`}
                                                    onClick={handleToggleClock}
                                                >
                                                    {isCheckedIn ? "Punch Check-Out ✕" : "Punch Check-In ✓"}
                                                </button>
                                            </div>

                                            <div className="telemetry-table">
                                                <div className="telemetry-row header">
                                                    <span>TIME</span>
                                                    <span>STAFF MEMBER</span>
                                                    <span>DEPARTMENT</span>
                                                    <span>ACTION</span>
                                                </div>
                                                <div className="telemetry-row">
                                                    <span>09:02 AM</span>
                                                    <span>Alex Morgan (EMP-0142)</span>
                                                    <span>Engineering</span>
                                                    <span className="badge-pass">Check-in Logged</span>
                                                </div>
                                                <div className="telemetry-row">
                                                    <span>09:05 AM</span>
                                                    <span>David Vance (EMP-0210)</span>
                                                    <span>Product & Design</span>
                                                    <span className="badge-pass">Check-in Logged</span>
                                                </div>
                                                <div className="telemetry-row">
                                                    <span>09:12 AM</span>
                                                    <span>Sarah Jenkins (EMP-0089)</span>
                                                    <span>Human Resources</span>
                                                    <span className="badge-pass">Check-in Logged</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeDashboardTab === 'payroll' && (
                                    <div className="mockup-tab-content">
                                        <div className="revenue-box">
                                            <h4>Company Payroll Disbursals & Expense Ledger</h4>
                                            <div className="pos-log-items">
                                                <div className="pos-log-row">
                                                    <span>Monthly Salary Batch — October 2026</span>
                                                    <span>482 Employees</span>
                                                    <span className="pos-price">$248,500</span>
                                                    <span className="pos-status">Direct Deposit Sent ✓</span>
                                                </div>
                                                <div className="pos-log-row">
                                                    <span>Travel Reimbursement — London Summit</span>
                                                    <span>Alex Morgan</span>
                                                    <span className="pos-price">$1,420</span>
                                                    <span className="pos-status">Audited & Reimbursed ✓</span>
                                                </div>
                                                <div className="pos-log-row">
                                                    <span>Hardware Expense Claim — Ergonomic Desk</span>
                                                    <span>David Vance</span>
                                                    <span className="pos-price">$380</span>
                                                    <span className="pos-status">Approved by Admin ✓</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enterprise Client Logos Strip */}
            <section className="logos-strip-section">
                <div className="logos-strip">
                    <span className="logo-item">STRIPE</span>
                    <span className="logo-dot">•</span>
                    <span className="logo-item">MICROSOFT</span>
                    <span className="logo-dot">•</span>
                    <span className="logo-item">DELOITTE</span>
                    <span className="logo-dot">•</span>
                    <span className="logo-item">AIRBNB</span>
                    <span className="logo-dot">•</span>
                    <span className="logo-item">UBER</span>
                    <span className="logo-dot">•</span>
                    <span className="logo-item">SPOTIFY</span>
                    <span className="logo-dot">•</span>
                    <span className="logo-item">ATLASSIAN</span>
                </div>
            </section>

            {/* Core Modules & Capabilities (2x2 Bento Grid tailored for EMS) */}
            <section className="capabilities-section" id="capabilities">
                {/* Section Header */}
                <div className="capabilities-header">
                    <div className="capabilities-header-left">
                        <div className="section-pill">
                            <span className="pill-dot"></span>
                            <span className="pill-text">CORE MODULES</span>
                        </div>
                        <h2 className="capabilities-title">
                            Everything your enterprise needs to operate <span className="headline-italic">and</span> thrive
                        </h2>
                    </div>
                    <div className="capabilities-header-right">
                        <p className="capabilities-desc">
                            Replace messy spreadsheets, manual attendance registers, and slow email approvals with one high-performance workforce operating platform.
                        </p>
                    </div>
                </div>

                {/* 2x2 Bento Grid */}
                <div className="bento-grid">
                    {/* Card 1: Attendance Management & Daily Punch Clocks */}
                    <div className="bento-card">
                        <div className="card-top">
                            <div className="card-icon-box">
                                <Clock size={20} className="card-icon" />
                            </div>
                            <span className="card-tag">SUB-SECOND TIMESTAMPS</span>
                        </div>

                        <h3 className="card-title">Real-Time Attendance & Session Timers</h3>
                        <p className="card-desc">
                            Sub-second digital check-in and check-out with multiple daily sessions. Automatic overtime calculation, shift logs, and monthly timesheet generation.
                        </p>

                        {/* Interactive Widget for Card 1 */}
                        <div className="card-widget widget-gate">
                            <div className="widget-header">
                                <span className="widget-label">LIVE SHIFT TELEMETRY</span>
                                <span className="widget-badge-online">SHIFT IN PROGRESS</span>
                            </div>
                            <div className="gate-metrics">
                                <div className="gate-metric-item">
                                    <span className="gate-metric-label">FIRST PUNCH</span>
                                    <span className="gate-metric-val">09:00 AM</span>
                                </div>
                                <div className="gate-metric-item">
                                    <span className="gate-metric-label">ACTIVE HOURS</span>
                                    <span className="gate-metric-val">{clockTimer}</span>
                                </div>
                                <div className="gate-metric-item">
                                    <span className="gate-metric-label">OVERTIME</span>
                                    <span className="gate-metric-val">+0h 42m</span>
                                </div>
                            </div>
                            <button className="widget-action-btn" onClick={handleToggleClock}>
                                {isCheckedIn ? "Simulate Punch Out" : "Simulate Punch In"}
                            </button>
                        </div>
                    </div>

                    {/* Card 2: 1-Click Leave Approval & Balances */}
                    <div className="bento-card">
                        <div className="card-top">
                            <div className="card-icon-box">
                                <Calendar size={20} className="card-icon" />
                            </div>
                            <span className="card-tag tag-meta">LEAVE WORKFLOW BOT</span>
                        </div>

                        <h3 className="card-title">Leave Applications & Approval Pipeline</h3>
                        <p className="card-desc">
                            Transparent leave balances for Paid, Sick, and Casual leaves. Real-time submission with instant 1-click administrative review and email alerts.
                        </p>

                        {/* Interactive Widget for Card 2 */}
                        <div className="card-widget widget-whatsapp">
                            <div className="whatsapp-header">
                                <span className="wa-dot"></span>
                                <span className="wa-title">LEAVE REQUEST DISPATCH</span>
                                <span className="wa-status">
                                    {leaveApproved ? "APPROVED ✓" : leaveRejected ? "REJECTED ✕" : "PENDING ACTION"}
                                </span>
                            </div>
                            <div className="wa-message-preview">
                                <p className="wa-text">
                                    <strong>Sarah Jenkins (HR Dept):</strong> "Requesting 3 days of Paid Annual Leave from Oct 28 to Oct 30 for family travel. Balance: 12 days remaining."
                                </p>
                                <div className="wa-actions">
                                    <button className="wa-action-btn approve" onClick={handleApproveLeave}>
                                        Approve Leave ✓
                                    </button>
                                    <button className="wa-action-btn reject" onClick={handleRejectLeave}>
                                        Decline ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Automated Payroll & Instant Payslips */}
                    <div className="bento-card">
                        <div className="card-top">
                            <div className="card-icon-box">
                                <FileText size={20} className="card-icon" />
                            </div>
                            <span className="card-tag">STATUTORY TAX ENGINE</span>
                        </div>

                        <h3 className="card-title">Smart Payroll & 1-Click Payslips</h3>
                        <p className="card-desc">
                            Rapid salary generation factoring basic salary, allowances, and statutory tax deductions. Instant PDF payslip downloads for employees.
                        </p>

                        {/* Interactive Widget for Card 3 */}
                        <div className="card-widget widget-pos">
                            <div className="pos-top-row">
                                <span className="pos-term-title">SALARY BREAKDOWN PREVIEW</span>
                                <span className="pos-tab-name">ROLE: {salaryRoles[selectedRole].role}</span>
                            </div>

                            <div className="pos-products-row">
                                <div 
                                    className={`pos-product-item ${selectedRole === 'engineer' ? 'selected' : ''}`}
                                    onClick={() => setSelectedRole('engineer')}
                                >
                                    <div className="product-title">Software Engineer</div>
                                    <div className="product-price">{salaryRoles.engineer.net}</div>
                                    <div className="product-stock">Tax: {salaryRoles.engineer.tax}</div>
                                </div>

                                <div 
                                    className={`pos-product-item ${selectedRole === 'designer' ? 'selected' : ''}`}
                                    onClick={() => setSelectedRole('designer')}
                                >
                                    <div className="product-title">Product Designer</div>
                                    <div className="product-price">{salaryRoles.designer.net}</div>
                                    <div className="product-stock">Tax: {salaryRoles.designer.tax}</div>
                                </div>

                                <div 
                                    className={`pos-product-item ${selectedRole === 'manager' ? 'selected' : ''}`}
                                    onClick={() => setSelectedRole('manager')}
                                >
                                    <div className="product-title">Ops Manager</div>
                                    <div className="product-price">{salaryRoles.manager.net}</div>
                                    <div className="product-stock">Tax: {salaryRoles.manager.tax}</div>
                                </div>
                            </div>

                            <div className="pos-bottom-row">
                                <span className="pos-sync-text">Basic {salaryRoles[selectedRole].basic} + HRA {salaryRoles[selectedRole].hra}</span>
                                <button className="pos-charge-btn" onClick={handleDownloadSlip}>
                                    {slipDownloaded ? "Generated & Downloaded ✓" : `Download Payslip PDF`}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Expense Claims & Reimbursements */}
                    <div className="bento-card">
                        <div className="card-top">
                            <div className="card-icon-box">
                                <Receipt size={20} className="card-icon" />
                            </div>
                            <span className="card-tag tag-gold">AUDIT-READY CLAIMS</span>
                        </div>

                        <h3 className="card-title">Expense Audits & Reimbursements</h3>
                        <p className="card-desc">
                            Digital receipt submissions for travel, software licenses, and client expenses. Complete audit trails, manager sign-offs, and swift disbursals.
                        </p>

                        {/* Interactive Widget for Card 4 */}
                        <div className="card-widget widget-heatmap">
                            <div className="heatmap-header">
                                <span className="heatmap-title">LIVE DEPARTMENT EXPENSE PIPELINE</span>
                                <span className="heatmap-density-badge">$12,450 REIMBURSED (18 CLAIMS)</span>
                            </div>

                            <div className="heatmap-bars">
                                <div className="density-bar-col">
                                    <div className="density-bar" style={{ height: '35%' }}></div>
                                    <span className="bar-time">Sales</span>
                                </div>
                                <div className="density-bar-col highlight">
                                    <div className="density-bar bar-purple" style={{ height: '85%' }}></div>
                                    <span className="bar-time">Eng</span>
                                </div>
                                <div className="density-bar-col">
                                    <div className="density-bar" style={{ height: '45%' }}></div>
                                    <span className="bar-time">Product</span>
                                </div>
                                <div className="density-bar-col">
                                    <div className="density-bar" style={{ height: '30%' }}></div>
                                    <span className="bar-time">HR</span>
                                </div>
                                <div className="density-bar-col">
                                    <div className="density-bar" style={{ height: '65%' }}></div>
                                    <span className="bar-time">Finance</span>
                                </div>
                                <div className="density-bar-col">
                                    <div className="density-bar" style={{ height: '40%' }}></div>
                                    <span className="bar-time">Ops</span>
                                </div>
                            </div>

                            <div className="heatmap-footer">
                                <span>Recent Claim: London Summit Flight ($1,420)</span>
                                <span>Status: Approved & Disbursed ✓</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Frequently Asked Questions (Accordion) */}
            <section className="faq-section" id="faq">
                <div className="faq-container">
                    <div className="faq-header">
                        <div className="section-pill">
                            <span className="pill-dot"></span>
                            <span className="pill-text">FREQUENTLY ASKED QUESTIONS</span>
                        </div>
                        <h2 className="faq-title">Workforce & Integration Answers</h2>
                        <p className="faq-subtitle">
                            Everything you need to know about setting up employee rosters, payroll rules, and attendance workflows.
                        </p>
                    </div>

                    <div className="faq-accordion-list">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <div 
                                    key={index} 
                                    className={`faq-item ${isOpen ? 'open' : ''}`}
                                    onClick={() => setOpenFaq(isOpen ? null : index)}
                                >
                                    <div className="faq-question-row">
                                        <h4 className="faq-question-text">{faq.question}</h4>
                                        <button className="faq-toggle-btn" aria-label="Toggle Question">
                                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                    </div>
                                    {isOpen && (
                                        <div className="faq-answer-row">
                                            <p className="faq-answer-text">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* High-Converting CTA Banner Section */}
            <section className="cta-banner-section">
                <div className="cta-banner-box">
                    <div className="cta-beam-accent"></div>
                    <h2 className="cta-headline">
                        Ready to elevate your workforce <span className="headline-italic">and</span> operations?
                    </h2>
                    <p className="cta-subtext">
                        Join leading enterprises using the Employee Management System to eliminate HR overhead, automate payroll, and empower employees.
                    </p>
                    <div className="cta-buttons">
                        <button className="btn-hero-primary" onClick={navigateAuth}>
                            {token ? "Enter Employee Dashboard" : "Access Employee Portal"}
                        </button>
                        <button className="btn-hero-secondary" onClick={() => setDemoModalOpen(true)}>
                            Request Enterprise Demo
                        </button>
                    </div>
                    <div className="cta-guarantee">
                        <span>✓ Instant Cloud Deployment</span>
                        <span>✓ Automated Excel/CSV Staff Migration</span>
                        <span>✓ 99.99% Uptime Guarantee</span>
                    </div>
                </div>
            </section>

            {/* Enterprise Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand-col">
                        <div className="landing-brand">
                            <div className="brand-cube-icon">
                                <Users size={20} className="brand-logo-icon" />
                            </div>
                            <div className="brand-text-group">
                                <span className="brand-title">EMPLOYEE MANAGEMENT SYSTEM</span>
                                <span className="brand-sub">ENTERPRISE WORKFORCE OS</span>
                            </div>
                        </div>
                        <p className="footer-desc">
                            Cloud-native workforce administration, attendance tracking, and autonomous payroll platform. Designed for modern teams, HR managers, and enterprise organizations.
                        </p>
                        <div className="system-health-badge">
                            <span className="health-dot"></span>
                            <span>ALL SYSTEMS OPERATIONAL • API V2.4</span>
                        </div>
                    </div>

                    <div className="footer-links-col">
                        <h4>Core Modules</h4>
                        <a href="#capabilities">Staff Directory</a>
                        <a href="#capabilities">Attendance & Timers</a>
                        <a href="#capabilities">Leave Management</a>
                        <a href="#capabilities">Payroll & Payslips</a>
                    </div>

                    <div className="footer-links-col">
                        <h4>Management</h4>
                        <a href="#capabilities">Department Hierarchy</a>
                        <a href="#capabilities">Expense Reimbursements</a>
                        <a href="#capabilities">Company Bulletins</a>
                        <a href="#dashboard-preview">Live HR Telemetry</a>
                    </div>

                    <div className="footer-links-col">
                        <h4>Security & Audit</h4>
                        <span>Role-Based Access (RBAC)</span>
                        <span>AES-256 Cloud Encryption</span>
                        <span>Statutory Tax Compliance</span>
                        <span>SOC2 Type II Ready</span>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 Employee Management System Inc. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#security">Security Architecture</a>
                    </div>
                </div>
            </footer>

            {/* Book a Demo Modal */}
            {demoModalOpen && (
                <div className="demo-modal-overlay" onClick={() => setDemoModalOpen(false)}>
                    <div className="demo-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setDemoModalOpen(false)}>
                            <X size={20} />
                        </button>
                        <div className="modal-icon-badge">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="modal-title">Schedule an HR Architecture Walkthrough</h3>
                        <p className="modal-desc">
                            Discover how the Employee Management System streamlines staff onboarding, attendance logs, and automated payslip generation in under 15 minutes.
                        </p>
                        <form onSubmit={handleBookDemoSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Work Email</label>
                                <input 
                                    type="email" 
                                    placeholder="hr@yourcompany.com" 
                                    value={demoEmail}
                                    onChange={(e) => setDemoEmail(e.target.value)}
                                    required
                                    className="modal-input"
                                />
                            </div>
                            <button type="submit" className="btn-hero-primary modal-submit">
                                Confirm Private Demo
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
