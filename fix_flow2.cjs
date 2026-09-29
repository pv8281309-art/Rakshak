const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

// Fix Auth Catch block
c = c.replace(
  /setIsProvisioning\(false\);\s*return;\s*}\s*}/,
  '}\n      }'
);

// Fix Firestore Catch block
c = c.replace(
  /alert\("Firestore Database Error:[^]+?setIsProvisioning\(false\);\s*return;\s*}/,
  '// Do not block UI\n        }'
);

// Add Temp Password to table header
c = c.replace(
  /<th className="px-5 py-4 font-semibold">Customer ID<\/th>/,
  '<th className="px-5 py-4 font-semibold">Customer ID</th>\n                <th className="px-5 py-4 font-semibold">Temp Password</th>'
);

// Add Temp Password to table row
c = c.replace(
  /\{customer\.id\}\s*<\/span>\s*<\/td>/g,
  `{customer.id}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {customer._tempPass ? (
                      <span className="font-mono text-white text-xs bg-slate-800 px-2 py-1 rounded">
                        {customer._tempPass}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs italic">Hidden</span>
                    )}
                  </td>`
);

// Save generated password in state
c = c.replace(
  /setCustomers\(prev => \[\{ id: formData\.customerId, \.\.\.customerData, lastLogin: null \}, \.\.\.prev\]\);/,
  'setCustomers(prev => [{ id: formData.customerId, ...customerData, lastLogin: null, _tempPass: tempPass }, ...prev]);'
);

fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
