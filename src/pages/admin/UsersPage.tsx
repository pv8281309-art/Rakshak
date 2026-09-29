import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit2, Ban, ShieldCheck, Mail, UserX, Phone, User, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TelemetrySyncService } from '../../services/TelemetrySyncService';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = () => {
    try {
      TelemetrySyncService.initialize();
      const customers = TelemetrySyncService.getCustomers();
      
      const adminUser = {
        id: 'ADM-001',
        name: 'National Highway Trauma Commander',
        email: 'commander@operation-rakshak.gov.in',
        phone: '+91 11 2659 8700',
        role: 'admin',
        status: 'active',
        joined: 'Jan 15, 2026',
        location: 'HQ, New Delhi'
      };

      const mapped = customers.map((c: any, idx: number) => ({
        id: c.customerId || `USR-IN-${150000 + idx}`,
        name: c.name,
        email: c.email || `${c.name.toLowerCase().replace(/\s+/g, '.')}@rakshak-subscriber.in`,
        phone: c.phone || '+91 98110 24890',
        role: 'subscriber',
        status: 'active',
        joined: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Feb 10, 2026',
        location: `${c.city}, ${c.state}`
      }));

      setUsers([adminUser, ...mapped]);
      setLoading(false);
    } catch (e) {
      console.error('Error loading users:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();

    let unsub: any = null;
    if (isFirebaseConfigured && db) {
      unsub = onSnapshot(query(collection(db, 'customers')), () => {
        loadUsers();
      }, () => loadUsers());
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full space-y-6 font-sans max-w-7xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <User size={13} /> Operation Rakshak Personnel & User Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Access & User Management</h1>
          <p className="text-sm text-slate-400 mt-1">Directory of command operators, registered highway subscribers, and verified drivers.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span className="font-mono text-white font-bold">{users.length}</span> Registered Accounts
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, verified mobile, email, or user ID..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bolt-card rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">User Name & ID</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Authorization Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Enrolled Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading user accounts...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No users match this filter.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{user.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-0.5">
                      <Mail size={13} className="text-slate-500" /> {user.email}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Phone size={11} className="text-slate-500" /> {user.phone}
                    </div>
                  </td>
                  <td className="p-4">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-400 text-[10px] font-black uppercase tracking-wider border border-purple-500/30">
                        <ShieldCheck size={12} /> COMMAND ADMIN
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                        SUBSCRIBER
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      ACTIVE
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-400">{user.joined}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors shadow-xs" title="Edit User">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
