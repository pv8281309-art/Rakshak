const fs = require('fs');

const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `              {/* User Dashboards (Placeholders) */}
              <Route path="/user/dashboard" element={<Placeholder title="User (Customer) Dashboard" />} />
              <Route path="/hospital/dashboard" element={<Placeholder title="Hospital Dashboard" />} />
              <Route path="/family/dashboard" element={<Placeholder title="Family Dashboard" />} />

              {/* Admin Routes */}
              <Route element={<ProtectedRoute />}>`;

const replacement = `              {/* User Dashboards (Placeholders) */}
              <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                <Route path="/user/dashboard" element={<Placeholder title="User (Customer) Dashboard" />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['hospital']} />}>
                <Route path="/hospital/dashboard" element={<Placeholder title="Hospital Dashboard" />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['family']} />}>
                <Route path="/family/dashboard" element={<Placeholder title="Family Dashboard" />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>`;

content = content.replace(target, replacement);

fs.writeFileSync(filePath, content);
