import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { UserLayout } from './layouts/UserLayout';
import { HospitalRoot } from './layouts/HospitalRoot';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingContactWidget } from './components/FloatingContactWidget';
import { RakshakAccidentNotifier } from './components/RakshakAccidentNotifier';

// Lazy-loaded Pages & Portals for Optimized Code-Splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));

// Admin Pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const LiveMonitoring = lazy(() => import('./pages/admin/LiveMonitoring'));
const AlertsSOS = lazy(() => import('./pages/admin/AlertsSOS'));
const AccessProvisioning = lazy(() => import('./pages/admin/AccessProvisioning'));
const HospitalAccess = lazy(() => import('./pages/admin/HospitalAccess'));
const AmbulanceTracking = lazy(() => import('./pages/admin/AmbulanceTracking'));
const UserReports = lazy(() => import('./pages/admin/UserReports'));
const ResourceManagement = lazy(() => import('./pages/admin/ResourceManagement'));
const SecurityThreatDefense = lazy(() => import('./pages/admin/SecurityThreatDefense'));
const ReportAnalytics = lazy(() => import('./pages/admin/ReportAnalytics'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const ResourceMonitorDashboard = lazy(() => import('./pages/admin/ResourceMonitorDashboard'));

// User Pages
const ChangePassword = lazy(() => import('./pages/user/ChangePassword'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const ReportAccident = lazy(() => import('./pages/user/ReportAccident'));
const LiveTracking = lazy(() => import('./pages/user/LiveTracking'));
const MyAlerts = lazy(() => import('./pages/user/MyAlerts'));
const EmergencyContacts = lazy(() => import('./pages/user/EmergencyContacts'));
const NearbyHospitals = lazy(() => import('./pages/user/NearbyHospitals'));
const SafetyResources = lazy(() => import('./pages/user/SafetyResources'));
const Tutorials = lazy(() => import('./pages/user/Tutorials'));
const UserProfile = lazy(() => import('./pages/user/UserProfile'));
const UserSettings = lazy(() => import('./pages/user/UserSettings'));

// Family Pages
const FamilyDashboard = lazy(() => import('./pages/family/FamilyDashboard'));

// Hospital Pages
const HospitalOverview = lazy(() => import('./pages/hospital/HospitalOverview').then(m => ({ default: m.HospitalOverview })));
const IncomingPatients = lazy(() => import('./pages/hospital/IncomingPatients').then(m => ({ default: m.IncomingPatients })));
const EmergencyQueue = lazy(() => import('./pages/hospital/EmergencyQueue').then(m => ({ default: m.EmergencyQueue })));
const AmbulanceTrackingHospital = lazy(() => import('./pages/hospital/AmbulanceTrackingHospital').then(m => ({ default: m.AmbulanceTrackingHospital })));
const BedManagement = lazy(() => import('./pages/hospital/BedManagement').then(m => ({ default: m.BedManagement })));
const BloodBank = lazy(() => import('./pages/hospital/BloodBank').then(m => ({ default: m.BloodBank })));
const PatientRecords = lazy(() => import('./pages/hospital/PatientRecords').then(m => ({ default: m.PatientRecords })));
const HospitalAlerts = lazy(() => import('./pages/hospital/HospitalAlerts').then(m => ({ default: m.HospitalAlerts })));
const HospitalCommandCenter = lazy(() => import('./pages/hospital/HospitalCommandCenter').then(m => ({ default: m.HospitalCommandCenter })));
const HospitalReports = lazy(() => import('./pages/hospital/HospitalReports').then(m => ({ default: m.HospitalReports })));
const HospitalProfile = lazy(() => import('./pages/hospital/HospitalProfile').then(m => ({ default: m.HospitalProfile })));
const HospitalSettings = lazy(() => import('./pages/hospital/HospitalSettings').then(m => ({ default: m.HospitalSettings })));
const HospitalHelp = lazy(() => import('./pages/hospital/HospitalHelp').then(m => ({ default: m.HospitalHelp })));

const GlobalLoader = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-mono">
    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
    <div className="text-xs uppercase tracking-widest text-amber-400 font-bold animate-pulse">
      LOADING OPERATION RAKSHAK 3.0...
    </div>
  </div>
);

const Placeholder = ({ title }: { title: string }) => (
  <div className="h-full flex items-center justify-center text-slate-400">
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-white mb-2">{title}</h2>
      <p>This module is under construction.</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <FloatingContactWidget />
              <RakshakAccidentNotifier />
              <Suspense fallback={<GlobalLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* User Portal Routes */}
                  <Route path="/user/login" element={<Navigate to="/login?role=user" replace />} />
                  <Route path="/user/change-password" element={<ChangePassword />} />
                  <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                    <Route element={<UserLayout />}>
                      <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
                      <Route path="/user/dashboard" element={<UserDashboard />} />
                      <Route path="/user/report" element={<ReportAccident />} />
                      <Route path="/user/tracking" element={<LiveTracking />} />
                      <Route path="/user/alerts" element={<MyAlerts />} />
                      <Route path="/user/contacts" element={<EmergencyContacts />} />
                      <Route path="/user/hospitals" element={<NearbyHospitals />} />
                      <Route path="/user/resources" element={<SafetyResources />} />
                      <Route path="/user/tutorials" element={<Tutorials />} />
                      <Route path="/user/profile" element={<UserProfile />} />
                      <Route path="/user/settings" element={<UserSettings />} />
                    </Route>
                  </Route>

                  {/* Hospital Portal Routes */}
                  <Route path="/hospital-dashboard" element={<Navigate to="/hospital/overview" replace />} />
                  <Route element={<ProtectedRoute allowedRoles={['hospital']} />}>
                    <Route element={<HospitalRoot />}>
                      <Route path="/hospital" element={<Navigate to="/hospital/overview" replace />} />
                      <Route path="/hospital/dashboard" element={<Navigate to="/hospital/overview" replace />} />
                      <Route path="/hospital/overview" element={<HospitalOverview />} />
                      <Route path="/hospital/incoming" element={<IncomingPatients />} />
                      <Route path="/hospital/queue" element={<EmergencyQueue />} />
                      <Route path="/hospital/ambulances" element={<AmbulanceTrackingHospital />} />
                      <Route path="/hospital/beds" element={<BedManagement />} />
                      <Route path="/hospital/blood-bank" element={<BloodBank />} />
                      <Route path="/hospital/patients" element={<PatientRecords />} />
                      <Route path="/hospital/alerts" element={<HospitalAlerts />} />
                      <Route path="/hospital/command-center" element={<HospitalCommandCenter />} />
                      <Route path="/hospital/reports" element={<HospitalReports />} />
                      <Route path="/hospital/profile" element={<HospitalProfile />} />
                      <Route path="/hospital/settings" element={<HospitalSettings />} />
                      <Route path="/hospital/help" element={<HospitalHelp />} />
                    </Route>
                  </Route>

                  {/* Family Portal Routes */}
                  <Route path="/family/login" element={<Navigate to="/login?role=family" replace />} />
                  <Route element={<ProtectedRoute allowedRoles={['family']} />}>
                    <Route path="/family/dashboard" element={<FamilyDashboard />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route element={<AdminLayout />}>
                      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="/admin/dashboard" element={<Dashboard />} />
                      <Route path="/admin/live-monitoring" element={<LiveMonitoring />} />
                      <Route path="/admin/sos-notifications" element={<AlertsSOS />} />
                      <Route path="/admin/ambulance" element={<AmbulanceTracking />} />
                      <Route path="/admin/user-reports" element={<UserReports />} />
                      <Route path="/admin/resources" element={<ResourceManagement />} />
                      <Route path="/admin/error-monitor" element={<ResourceMonitorDashboard />} />
                      <Route path="/admin/audit-logs" element={<AuditLogs />} />
                      <Route path="/admin/notifications" element={<Placeholder title="Notifications" />} />
                      <Route path="/admin/report-analytics" element={<ReportAnalytics />} />
                      <Route path="/admin/system-health" element={<SecurityThreatDefense />} />
                      <Route path="/admin/settings" element={<AdminSettings />} />
                      <Route path="/admin/access-providing" element={<AccessProvisioning />} />
                      <Route path="/admin/hospitals" element={<HospitalAccess />} />
                    </Route>
                  </Route>
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
