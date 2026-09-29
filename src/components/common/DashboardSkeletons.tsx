import React from 'react';

export const AdminDashboardSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse font-sans">
      {/* Top Header stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-24 h-4 bg-slate-800 rounded-md" />
              <div className="w-10 h-10 bg-slate-800 rounded-xl" />
            </div>
            <div className="w-16 h-8 bg-slate-800 rounded-lg" />
            <div className="w-32 h-3 bg-slate-800/60 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Content Grid: Map & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 h-[400px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-48 h-5 bg-slate-800 rounded-md" />
            <div className="w-28 h-8 bg-slate-800 rounded-lg" />
          </div>
          <div className="w-full h-64 bg-slate-800/40 rounded-xl" />
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="w-36 h-5 bg-slate-800 rounded-md" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-full h-4 bg-slate-800 rounded-md" />
                <div className="w-2/3 h-3 bg-slate-800/60 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const UserDashboardSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse font-sans">
      {/* SOS Hero Banner Skeleton */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 w-full md:w-2/3">
          <div className="w-32 h-4 bg-slate-800 rounded-full" />
          <div className="w-3/4 h-8 bg-slate-800 rounded-xl" />
          <div className="w-full h-4 bg-slate-800/60 rounded-md" />
        </div>
        <div className="w-36 h-36 rounded-full bg-slate-800 shrink-0" />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="w-12 h-12 bg-slate-800 rounded-xl" />
            <div className="w-24 h-4 bg-slate-800 rounded-md" />
            <div className="w-16 h-3 bg-slate-800/60 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const HospitalDashboardSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="w-28 h-4 bg-slate-800 rounded-md" />
            <div className="w-20 h-8 bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="w-48 h-6 bg-slate-800 rounded-md" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-800/40 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
};

export const FamilyDashboardSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="w-28 h-4 bg-slate-800 rounded-md" />
                <div className="w-20 h-3 bg-slate-800/60 rounded-md" />
              </div>
            </div>
            <div className="h-20 bg-slate-800/40 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};
