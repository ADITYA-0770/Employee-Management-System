import React from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

const AdminRoute = () => {
    const context = useOutletContext();
    
    // If context is null, it means we might not be inside DashboardLayout, 
    // but we are in this app structure. 
    // We assume context provides isAdmin.
    if (context && context.isAdmin !== undefined) {
        return context.isAdmin ? <Outlet context={context} /> : <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
