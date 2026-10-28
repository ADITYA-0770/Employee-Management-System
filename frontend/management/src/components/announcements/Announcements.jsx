import React, { useState, useEffect } from 'react';
import { Bell, Calendar as CalendarIcon, Clock } from 'lucide-react';
import api from '../../services/api';
import '../departments/Departments.css';
import './Announcements.css';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await api.get('announcements/');
                // The backend returns { success: true, data: [...] }
                let dataToSet = res.data?.data || res.data?.results || res.data || [];
                if (!Array.isArray(dataToSet)) {
                    dataToSet = []; // safeguard against non-array responses
                }
                setAnnouncements(dataToSet);
            } catch (err) {
                if (err.response?.status === 404) {
                    setAnnouncements([]); // Backend returns 404 if empty
                } else {
                    console.error('Failed to fetch announcements', err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Announcements</h1>
                    <p>Stay up to date with the latest company news and notices</p>
                </div>
            </div>

            <div className="announcements-feed">
                {loading ? (
                    <div className="text-center py-4" style={{width: '100%'}}>Loading announcements...</div>
                ) : announcements.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={48} className="empty-icon" />
                        <h3>No Announcements</h3>
                        <p>There are currently no active announcements to display.</p>
                    </div>
                ) : (
                    announcements.map(ann => (
                        <div className="announcement-card-large" key={ann.id}>
                            <div className="ann-header">
                                <h2 className="ann-title">{ann.title}</h2>
                                <span className={`status-badge ${ann.status === 'published' ? 'approved' : 'pending'}`}>
                                    {ann.status || 'Active'}
                                </span>
                            </div>
                            <div className="ann-meta">
                                <span className="meta-item"><CalendarIcon size={14}/> {formatDate(ann.date || ann.publish_at)}</span>
                                {ann.expires_at && <span className="meta-item"><Clock size={14}/> Expires: {formatDate(ann.expires_at)}</span>}
                            </div>
                            <div className="ann-body">
                                <p>{ann.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Announcements;
