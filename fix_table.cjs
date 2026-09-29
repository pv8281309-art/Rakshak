const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

const oldTable = `<th className="px-5 py-4 font-semibold">Customer ID</th>
                <th className="px-5 py-4 font-semibold">Temp Password</th>
                <th className="px-5 py-4 font-semibold">Temp Password</th>
                <th className="px-5 py-4 font-semibold">Customer Details</th>
                <th className="px-5 py-4 font-semibold">Device & Vehicle</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>`;

const newTable = `<th className="px-5 py-4 font-semibold">Customer ID</th>
                <th className="px-5 py-4 font-semibold">Temp Password</th>
                <th className="px-5 py-4 font-semibold">Customer Details</th>
                <th className="px-5 py-4 font-semibold">Device & Vehicle</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>`;

c = c.replace(oldTable, newTable);

const oldRow = `<td className="px-5 py-3">
                    {customer._tempPass ? (
                      <span className="font-mono text-white text-xs bg-slate-800 px-2 py-1 rounded">
                        {customer._tempPass}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs italic">Hidden</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {customer._tempPass ? (
                      <span className="font-mono text-white text-xs bg-slate-800 px-2 py-1 rounded">
                        {customer._tempPass}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs italic">Hidden</span>
                    )}
                  </td>`;

const newRow = `<td className="px-5 py-3">
                    {customer._tempPass ? (
                      <div className="flex items-center gap-2">
                         <span className="font-mono text-white text-xs bg-slate-800 px-2 py-1 rounded">
                           {customer._tempPass}
                         </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs italic">Hidden</span>
                    )}
                  </td>`;
                  
c = c.replace(oldRow, newRow);

fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
