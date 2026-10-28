import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, LogOut, User as UserIcon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ toggleSidebar, isCollapsed, isMobile, profile }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    return (
        <header className="top-header">
            <div className="header-left">
                {/* Single, Proficient Sidebar Toggle Button */}
                <button 
                    className="menu-toggle" 
                    onClick={toggleSidebar}
                    title={isMobile ? "Toggle navigation menu" : (isCollapsed ? "Expand sidebar" : "Collapse sidebar")}
                    aria-label="Toggle Navigation Menu"
                >
                    <Menu size={22} className="menu-icon" />
                </button>

                <div className="header-status-indicator">
                    <span className="live-pulse-dot"></span>
                    <span className="live-pulse-text">EMS WORKFORCE OS</span>
                </div>
            </div>
            
            <div className="header-right">
                {/* Profile Pill Dropdown */}
                <div className="dropdown-container" ref={profileRef}>
                    <div 
                        className="user-profile-menu" 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        title="User Account"
                    >
                        <div className="avatar">
                            {profile?.first_name ? profile.first_name.charAt(0) : <User size={18} />}
                        </div>
                        <span className="user-name">
                            {profile?.first_name || profile?.username || 'Employee'}
                        </span>
                    </div>

                    {showProfileMenu && (
                        <div className="dropdown-menu profile-menu">
                            <div className="dropdown-header profile-header">
                                <div className="avatar large">
                                    {profile?.first_name ? profile.first_name.charAt(0) : <User size={24} />}
                                </div>
                                <div className="profile-info">
                                    <h3>{profile?.first_name || profile?.username || 'Employee'}</h3>
                                    <p>{profile?.email || 'employee@company.com'}</p>
                                </div>
                            </div>
                            <div className="dropdown-body">
                                <button className="dropdown-item" onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}>
                                    <UserIcon size={16} /> My Profile
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item text-red" onClick={handleLogout}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
