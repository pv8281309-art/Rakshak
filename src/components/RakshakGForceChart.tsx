import React, { useState, useEffect } from 'react';
import { useRakshakDevice } from '../hooks/useRakshakDevice';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Gauge } from 'lucide-react';

interface DataPoint {
  time: string;
  totalG: number;
}

export const RakshakGForceChart: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { deviceData } = useRakshakDevice();
  const [chartData, setChartData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const currentTotalG = deviceData?.sensor?.totalG ?? 1.0;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setChartData(prev => {
      const newPoint: DataPoint = { time: timeStr, totalG: Number(currentTotalG.toFixed(2)) };
      // Keep last 15 points for rolling live chart
      const updated = [...prev, newPoint];
      if (updated.length > 15) {
        updated.shift();
      }
      return updated;
    });
  }, [deviceData?.sensor?.totalG]);

  return (
    <div className={`bg-[#0D1527] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Gauge size={18} className="text-blue-500 animate-pulse" />
          <h4 className="font-bold text-white text-sm">Real-Time Total G-Force Telemetry Stream (/devices/RAKSHAK_001/sensor/totalG)</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Live Recharts Stream
          </span>
        </div>
      </div>

      <div className="h-56 w-full pt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                domain={[0, 'auto']} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                formatter={(value: any) => [`${value} G`, 'Total G-Force']}
                labelStyle={{ color: '#94a3b8', marginBottom: '2px' }}
              />
              <Line 
                type="monotone" 
                dataKey="totalG" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }} 
                activeDot={{ r: 6, fill: '#60a5fa' }} 
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
            Waiting for live telemetry data stream...
          </div>
        )}
      </div>
    </div>
  );
};
