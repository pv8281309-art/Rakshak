const fs = require('fs');
const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `import UserDashboard from './pages/user/UserDashboard';`;
const newImports = `import UserLogin from './pages/user/UserLogin';
import { UserLayout } from './layouts/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import ReportAccident from './pages/user/ReportAccident';
import LiveTracking from './pages/user/LiveTracking';
import MyAlerts from './pages/user/MyAlerts';
import EmergencyContacts from './pages/user/EmergencyContacts';
import NearbyHospitals from './pages/user/NearbyHospitals';
import SafetyResources from './pages/user/SafetyResources';
import UserProfile from './pages/user/UserProfile';
import UserSettings from './pages/user/UserSettings';`;

content = content.replace(targetStr, newImports);

const routesTarget = `              {/* User Dashboards (Placeholders) */}
              <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                <Route path="/user/dashboard" element={<UserDashboard />} />
              </Route>`;

const newRoutes = `              {/* User Portal Routes */}
              <Route path="/user/login" element={<UserLogin />} />
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
                  <Route path="/user/profile" element={<UserProfile />} />
                  <Route path="/user/settings" element={<UserSettings />} />
                </Route>
              </Route>`;

content = content.replace(routesTarget, newRoutes);
fs.writeFileSync(filePath, content);
console.log("Patched App.tsx with User routes");
