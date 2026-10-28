import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Briefcase, Mail, Phone, MapPin, Calendar, Building, CreditCard } from 'lucide-react';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
    const { profile: userProfile } = useOutletContext();
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployeeProfile = async () => {
            try {
                // Fetch employee-specific data if available
                const res = await api.get('employees/profile/');
                setEmployeeData(res.data);
            } catch (err) {
                console.log('User might not be an employee or endpoint is missing.', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeProfile();
    }, []);

    if (loading) {
        return <div className="profile-page-container"><div className="profile-loader">Loading Profile...</div></div>;
    }

    const initials = userProfile?.first_name
        ? userProfile.first_name.charAt(0)
        : (userProfile?.email ? userProfile.email.charAt(0).toUpperCase() : 'U');

    return (
        <div className="profile-page-container">
            <div className="profile-header-card">
                <div className="profile-avatar-container">
                    <div className="profile-avatar">
                        {initials}
                    </div>
                </div>
                <div className="profile-title-container">
                    <h1>{employeeData?.employee_name || userProfile?.first_name || 'System User'} {userProfile?.last_name || ''}</h1>
                    <p>{employeeData?.designation || (userProfile?.is_staff ? 'Administrator' : 'User')}</p>
                    <div className="profile-badge">
                        {employeeData?.status || 'Active'}
                    </div>
                </div>
            </div>

            <div className="profile-content-grid">

                {/* Personal Information */}
                <div className="profile-info-card">
                    <h3><User size={20} /> Personal Information</h3>
                    <div className="profile-info-grid">
                        <div className="info-item">
                            <label>Email Address</label>
                            <p>{userProfile?.email || 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <label>Phone Number</label>
                            <p>{employeeData?.phone || 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <label>Date of Birth</label>
                            <p>{employeeData?.date_of_birth || 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <label>Gender</label>
                            <p style={{ textTransform: 'capitalize' }}>{employeeData?.gender || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Corporate Information */}
                <div className="profile-info-card">
                    <h3><Briefcase size={20} /> Corporate Details</h3>
                    <div className="profile-info-grid">
                        <div className="info-item">
                            <label>Employee ID</label>
                            <p>{employeeData?.employee_id || 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <label>Department</label>
                            <p>{employeeData?.department_name || employeeData?.department || 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <label>Date of Joining</label>
                            <p>{employeeData?.joining_date || 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <label>Salary</label>
                            <p>{employeeData?.salary ? `$${employeeData.salary}` : 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="profile-info-card" style={{ gridColumn: '1 / -1' }}>
                    <h3><MapPin size={20} /> Address Information</h3>
                    <div className="profile-info-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="info-item">
                            <label>City</label>
                            <p>{employeeData?.city || 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <label>State</label>
                            <p>{employeeData?.state || 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <label>Country</label>
                            <p>{employeeData?.country || 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <label>Pincode</label>
                            <p>{employeeData?.pincode || 'N/A'}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
