import React from 'react';
import { useHospital } from '../../contexts/HospitalContext';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Clock, 
  Activity, 
  Users, 
  Droplet, 
  BedDouble, 
  CheckCircle2, 
  Printer 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { cn } from '../../lib/utils';

export const HospitalReports: React.FC = () => {
  const { 
    hospitalId, 
    hospital, 
    activeEmergencies, 
    beds, 
    bloodBank, 
    kpis 
  } = useHospital();

  // Severity distribution data for Pie Chart
  let critCount = 0;
  let highCount = 0;
  let medCount = 0;
  let lowCount = 0;

  activeEmergencies.forEach(e => {
    if (e.severity === 'CRITICAL') critCount++;
    else if (e.severity === 'HIGH') highCount++;
    else if (e.severity === 'MEDIUM') medCount++;
    else lowCount++;
  });

  const severityData = [
    { name: 'Critical', value: Math.max(critCount, 1), color: '#ef4444' },
    { name: 'High', value: Math.max(highCount, 1), color: '#f97316' },
    { name: 'Medium', value: Math.max(medCount, 1), color: '#eab308' },
    { name: 'Low', value: Math.max(lowCount, 1), color: '#10b981' }
  ];

  // Bed Distribution Bar Data
  const bedData = [
    { name: 'General', Available: beds?.general?.available ?? 12, Occupied: beds?.general?.occupied ?? 18 },
    { name: 'Emergency', Available: beds?.emergency?.available ?? 4, Occupied: beds?.emergency?.occupied ?? 16 },
    { name: 'ICU', Available: beds?.icu?.available ?? 3, Occupied: beds?.icu?.occupied ?? 7 },
    { name: 'HDU', Available: beds?.hdu?.available ?? 2, Occupied: beds?.hdu?.occupied ?? 6 },
    { name: 'Pediatric', Available: beds?.pediatric?.available ?? 3, Occupied: beds?.pediatric?.occupied ?? 7 },
  ];

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = ['Patient ID', 'Incident ID', 'Patient Name', 'Severity', 'Condition', 'Department', 'Ambulance', 'Status'];
    const rows = activeEmergencies.map(e => [
      e.patientId,
      e.incidentId,
      `"${e.patientName}"`,
      e.severity,
      `"${e.condition}"`,
      e.department,
      e.ambulanceId,
      e.admissionStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Operation_Rakshak_Patient_Report_${hospitalId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Facility Performance Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Hospital Analytics & Operational Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time trauma volume, bed utilization curves, and emergency shift logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Shift Handover</span>
          </button>
        </div>
      </div>

      {/* METRIC HIGHLIGHTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Intake Cases</span>
          <span className="text-3xl font-black text-white mt-1 block font-mono">{kpis.patientsToday}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Logged emergency encounters</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Critical Ratio</span>
          <span className="text-3xl font-black text-red-400 mt-1 block font-mono">
            {kpis.criticalIncoming}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Immediate polytrauma cases</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bed Utilization</span>
          <span className="text-3xl font-black text-cyan-400 mt-1 block font-mono">{kpis.occupancyRate}%</span>
          <span className="text-[11px] text-slate-500 mt-1 block">{kpis.availableBeds} beds currently vacant</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Transit ETA</span>
          <span className="text-3xl font-black text-emerald-400 mt-1 block font-mono">11 min</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Traffic corridor transit avg</span>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BED ALLOCATION BAR CHART */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-cyan-400" />
            Ward Capacity vs Occupancy
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="Occupied" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Available" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SEVERITY BREAKDOWN PIE CHART */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Emergency Severity Distribution
          </h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 text-xs font-semibold pt-2 border-t border-slate-800">
            {severityData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                <span className="text-slate-300">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
