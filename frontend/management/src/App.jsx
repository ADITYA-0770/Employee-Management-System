import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './components/home/Home';
import Login from './components/auth/Login';
import DashboardLayout from './layouts/DashboardLayout';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import Departments from './components/departments/Departments';
import Employees from './components/employees/Employees';
import MyLeaves from './components/leaves/MyLeaves';
import MyExpenses from './components/expenses/MyExpenses';
import MyAttendance from './components/attendance/MyAttendance';
import Announcements from './components/announcements/Announcements';
import MyPayslips from './components/payslips/MyPayslips';
import AdminLeaves from './components/leaves/AdminLeaves';
import AdminAttendance from './components/attendance/AdminAttendance';
import AdminExpenses from './components/expenses/AdminExpenses';
import AdminAnnouncements from './components/announcements/AdminAnnouncements';
import AdminRoute from './components/auth/AdminRoute';
import Profile from './components/profile/Profile';

// Route Stubs for all other phases
const Placeholder = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p>This module is under construction.</p>
  </div>
);

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Authenticated Routes wrapped in Sidebar Layout */}
        <Route element={<DashboardLayout />}>
          {/* Common Routes */}
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/attendance" element={<MyAttendance />} />
          <Route path="/leaves" element={<MyLeaves />} />
          <Route path="/expenses" element={<MyExpenses />} />
          <Route path="/payslips" element={<MyPayslips />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Routes - Protected by AdminRoute */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/employees" element={<Employees />} />
            <Route path="/admin/departments" element={<Departments />} />
            <Route path="/admin/leaves" element={<AdminLeaves />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/expenses" element={<AdminExpenses />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
