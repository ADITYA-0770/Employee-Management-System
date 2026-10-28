import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import api from '../services/api';
import './DashboardLayout.css';

const DashboardLayout = () => {
    // Responsive state management
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Listen for viewport changes
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) {
                setMobileOpen(false); // Close mobile drawer when resizing up
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('accounts/profile/');
                setProfile(res.data);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    // Proficient Toggle: Drawer on Mobile, Smooth Collapse on Desktop
    const toggleSidebar = () => {
        if (isMobile) {
            setMobileOpen(prev => !prev);
        } else {
            setDesktopCollapsed(prev => !prev);
        }
    };

    const closeMobileSidebar = () => {
        setMobileOpen(false);
    };

    // Identify admin by is_staff, is_superuser, or membership in 'Admin' group
    const isAdmin = profile?.is_staff || profile?.is_superuser || (profile?.groups && profile.groups.includes('Admin'));

    if (loading) {
        return <div className="layout-loader">Loading EMS Portal...</div>;
    }

    return (
        <div className={`dashboard-layout ${(!isMobile && desktopCollapsed) ? 'desktop-collapsed' : ''} ${(isMobile && mobileOpen) ? 'mobile-open' : ''}`}>
            <Sidebar 
                isOpen={isMobile ? mobileOpen : !desktopCollapsed}
                isMobile={isMobile}
                isCollapsed={!isMobile && desktopCollapsed}
                toggleSidebar={toggleSidebar}
                closeSidebar={closeMobileSidebar}
                isAdmin={isAdmin} 
            />
            <div className="main-wrapper">
                <Header 
                    toggleSidebar={toggleSidebar} 
                    isCollapsed={!isMobile && desktopCollapsed}
                    isMobile={isMobile}
                    profile={profile} 
                />
                <main className="main-content">
                    <Outlet context={{ profile, isAdmin }} />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
