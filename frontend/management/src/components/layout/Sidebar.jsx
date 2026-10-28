import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    Calendar,
    Clock,
    Receipt,
    FileText,
    Bell,
    LogOut,
    X,
    Shield
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, isMobile, isCollapsed, toggleSidebar, closeSidebar, isAdmin }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={19} /> },
        { title: 'Attendance', path: '/attendance', icon: <Clock size={19} /> },
        { title: 'Leaves', path: '/leaves', icon: <Calendar size={19} /> },
        { title: 'Expenses', path: '/expenses', icon: <Receipt size={19} /> },
        { title: 'Payslips', path: '/payslips', icon: <FileText size={19} /> },
        { title: 'Announcements', path: '/announcements', icon: <Bell size={19} /> },
    ];

    const adminItems = [
        { title: 'Employees', path: '/admin/employees', icon: <Users size={19} /> },
        { title: 'Departments', path: '/admin/departments', icon: <Building2 size={19} /> },
        { title: 'Manage Leaves', path: '/admin/leaves', icon: <Calendar size={19} /> },
        { title: 'Manage Attendance', path: '/admin/attendance', icon: <Clock size={19} /> },
        { title: 'Manage Expenses', path: '/admin/expenses', icon: <Receipt size={19} /> },
        { title: 'Manage Announcements', path: '/admin/announcements', icon: <Bell size={19} /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const handleNavClick = () => {
        if (isMobile && closeSidebar) {
            closeSidebar();
        }
    };

    return (
        <>
            {/* Mobile Frosted Backdrop Overlay */}
            {isMobile && isOpen && (
                <div 
                    className="sidebar-overlay" 
                    onClick={closeSidebar}
                    aria-hidden="true"
                ></div>
            )}

            <aside className={`sidebar ${isMobile && isOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand-group">
                        <div className="sidebar-logo-icon">
                            <Users size={18} />
                        </div>
                        <div className="sidebar-title-text">
                            <h2>EMS Portal</h2>
                            <span className="sidebar-badge">WORKFORCE</span>
                        </div>
                    </div>

                    {/* ONLY visible on mobile screens */}
                    {isMobile && (
                        <button 
                            className="sidebar-mobile-close" 
                            onClick={closeSidebar}
                            aria-label="Close navigation menu"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="sidebar-content">
                    <div className="menu-section">
                        <p className="menu-label">Main Menu</p>
                        <nav className="nav-menu">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={handleNavClick}
                                        className={`nav-item ${isActive ? 'active' : ''}`}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-title">{item.title}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {isAdmin && (
                        <div className="menu-section">
                            <p className="menu-label">Administration</p>
                            <nav className="nav-menu">
                                {adminItems.map((item) => {
                                    const isActive = location.pathname.startsWith(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={handleNavClick}
                                            className={`nav-item ${isActive ? 'active' : ''}`}
                                        >
                                            <span className="nav-icon">{item.icon}</span>
                                            <span className="nav-title">{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    )}
                </div>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
