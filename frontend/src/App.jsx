import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import AppLayout from './components/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clinics from './pages/Clinics';
import Users from './pages/Users';
import ClinicSettings from './pages/ClinicSettings';
import PatientsList from './pages/patients/PatientsList';
import DoctorsList from './pages/doctors/DoctorsList';
import AppointmentsList from './pages/appointments/AppointmentsList';
import ConsultationsList from './pages/consultations/ConsultationsList';
import ConsultationDetails from './pages/consultations/ConsultationDetails';
import PrescriptionsList from './pages/prescriptions/PrescriptionsList';
import InvoicesList from './pages/billing/InvoicesList';
import NotificationsList from './pages/notifications/NotificationsList';
import AuditLogsList from './pages/audit/AuditLogsList';
import BookAppointment from './pages/appointments/BookAppointment';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import FindHospitals from './pages/external/FindHospitals';
import FindDoctors from './pages/external/FindDoctors';
import DoctorDetails from './pages/external/DoctorDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes wrapped with AppLayout */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            {/* Redirect / to /dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="clinics" element={
              <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                <Clinics />
              </RoleRoute>
            } />

            <Route path="users" element={
              <RoleRoute allowedRoles={['SUPER_ADMIN', 'CLINIC_ADMIN']}>
                <Users />
              </RoleRoute>
            } />

            <Route path="clinic/settings" element={
              <RoleRoute allowedRoles={['CLINIC_ADMIN']}>
                <ClinicSettings />
              </RoleRoute>
            } />

            <Route path="patients" element={
              <RoleRoute allowedRoles={['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
                <PatientsList />
              </RoleRoute>
            } />

            <Route path="doctors" element={
              <RoleRoute allowedRoles={['CLINIC_ADMIN', 'RECEPTIONIST', 'PATIENT']}>
                <DoctorsList />
              </RoleRoute>
            } />

            <Route path="appointments/book" element={
              <RoleRoute allowedRoles={['PATIENT']}>
                <BookAppointment />
              </RoleRoute>
            } />

            <Route path="external/hospitals" element={
              <RoleRoute allowedRoles={['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']}>
                <FindHospitals />
              </RoleRoute>
            } />

            <Route path="external/doctors" element={
              <RoleRoute allowedRoles={['CLINIC_ADMIN', 'RECEPTIONIST', 'PATIENT']}>
                <FindDoctors />
              </RoleRoute>
            } />
            
            <Route path="external/doctors/:id" element={
              <RoleRoute allowedRoles={['CLINIC_ADMIN', 'RECEPTIONIST', 'PATIENT']}>
                <DoctorDetails />
              </RoleRoute>
            } />

            <Route path="appointments" element={
              <RoleRoute allowedRoles={['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']}>
                <AppointmentsList />
              </RoleRoute>
            } />

            <Route path="consultations" element={
              <RoleRoute allowedRoles={['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']}>
                <ConsultationsList />
              </RoleRoute>
            } />
            
            <Route path="consultations/:id" element={
              <RoleRoute allowedRoles={['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']}>
                <ConsultationDetails />
              </RoleRoute>
            } />

            <Route path="prescriptions" element={
              <RoleRoute allowedRoles={['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']}>
                <PrescriptionsList />
              </RoleRoute>
            } />

            <Route path="billing" element={
              <RoleRoute allowedRoles={['SUPER_ADMIN', 'CLINIC_ADMIN', 'RECEPTIONIST', 'PATIENT']}>
                <InvoicesList />
              </RoleRoute>
            } />

            <Route path="notifications" element={<NotificationsList />} />
            
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Alias records to consultations for patients */}
            <Route path="records" element={
              <RoleRoute allowedRoles={['CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']}>
                <ConsultationsList />
              </RoleRoute>
            } />

            <Route path="audit-logs" element={
              <RoleRoute allowedRoles={['SUPER_ADMIN', 'CLINIC_ADMIN']}>
                <AuditLogsList />
              </RoleRoute>
            } />
          </Route>

          {/* Catch all unmatched routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
