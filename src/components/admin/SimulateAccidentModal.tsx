import React, { useState } from 'react';
import { useEmergencyResponse } from '../../contexts/EmergencyResponseContext';
import { X, Play, Zap, ShieldAlert, AlertTriangle, Layers, Activity } from 'lucide-react';

interface SimulateAccidentModalProps {
  onClose: () => void;
}

export const SimulateAccidentModal: React.FC<SimulateAccidentModalProps> = ({ onClose }) => {
  const { triggerSimulatedAccident } = useEmergencyResponse();
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('scenario-1');

  const scenarios = [
    {
      id: 'scenario-1',
      title: 'Scenario 1: Standard Critical Accident (ESP32 High-G)',
      desc: 'Severe collision (5.2G impact force, airbag deployed). Tests ESP32 ingestion -> recommendation ranking -> top hospital.',
      payload: {
        vehicleId: 'DL-01-AX-9942',
        patientName: 'Rohit Verma',
        latitude: 28.6139,
        longitude: 77.2090,
        locationText: 'Ring Road, Near AIIMS Flyover, Central Corridor',
        speed: 64,
        severity: 'CRITICAL',
        impactForceG: 5.2,
        airbagDeployed: true,
        rollOver: false,
        sensorSeverity: 'CRITICAL'
      }
    },
    {
      id: 'scenario-2',
      title: 'Scenario 2: Nearest Hospital Has NO ICU (ICU Requirement)',
      desc: 'Accident occurs 1.2 km from City Health Post (0 ICU beds). Tests that engine rejects nearest hospital for critical ICU cases.',
      payload: {
        vehicleId: 'HR-26-EQ-1088',
        patientName: 'Anil Kumar (Trauma/ICU Critical)',
        latitude: 28.6190,
        longitude: 77.2070, // 1 km from HOSP004 (which has 0 ICU beds)
        locationText: 'Connaught Outer Circle, Near Block M',
        speed: 72,
        severity: 'CRITICAL',
        impactForceG: 4.8,
        airbagDeployed: true,
        rollOver: true,
        sensorSeverity: 'CRITICAL'
      }
    },
    {
      id: 'scenario-3',
      title: 'Scenario 3: Farther Hospital with Dedicated Trauma Center',
      desc: 'Accident equidistant to general hospital vs Level 1 Trauma Center. Tests priority given to trauma capability & ETA.',
      payload: {
        vehicleId: 'UP-16-BZ-4411',
        patientName: 'Deepak Malhotra',
        latitude: 28.5800,
        longitude: 77.2200,
        locationText: 'South Extension II, Main Ring Road Junction',
        speed: 55,
        severity: 'CRITICAL',
        impactForceG: 4.2,
        airbagDeployed: true,
        sensorSeverity: 'CRITICAL'
      }
    },
    {
      id: 'scenario-4',
      title: 'Scenario 4: Stale Hospital Bed Data Warning',
      desc: 'Accident near Expressway. Hospital has beds but data is 25 minutes old. Tests stale data warning & score reduction.',
      payload: {
        vehicleId: 'DL-04-TC-7721',
        patientName: 'Sanjay Rawat',
        latitude: 28.4850,
        longitude: 77.4750, // Near Sharda Metro (stale bed data)
        locationText: 'Noida-Greater Noida Expressway KM 18',
        speed: 82,
        severity: 'HIGH',
        impactForceG: 3.8,
        airbagDeployed: true,
        sensorSeverity: 'HIGH'
      }
    },
    {
      id: 'scenario-8',
      title: 'Scenario 8: No Suitable Hospital Within Radius (Fallback)',
      desc: 'Remote incident coordinates far from equipped trauma centers (>60 km). Tests no-suitable-hospital fallback workflow.',
      payload: {
        vehicleId: 'UK-07-AL-3312',
        patientName: 'Karan Mehra',
        latitude: 29.3500, // Remote coordinates
        longitude: 78.1000,
        locationText: 'National Highway 58, Remote Bypass Section',
        speed: 45,
        severity: 'CRITICAL',
        impactForceG: 4.1,
        airbagDeployed: true,
        sensorSeverity: 'CRITICAL'
      }
    },
    {
      id: 'scenario-9',
      title: 'Scenario 9: Multi-Vehicle Collision (Simultaneous Incidents)',
      desc: 'High-speed pileup generating multiple independent incidents simultaneously.',
      payload: {
        vehicleId: 'DL-09-CD-6633',
        patientName: 'Priya Sen (Multi-Car Pileup)',
        latitude: 28.6350,
        longitude: 77.2250,
        locationText: 'ITO Crossing, Central Delhi',
        speed: 58,
        severity: 'CRITICAL',
        impactForceG: 6.1,
        airbagDeployed: true,
        rollOver: true,
        sensorSeverity: 'CRITICAL'
      }
    }
  ];

  const handleSimulate = async () => {
    const sc = scenarios.find(s => s.id === selectedScenario);
    if (!sc) return;

    setLoading(true);
    try {
      await triggerSimulatedAccident(sc.payload);
      onClose();
    } catch (err: any) {
      alert('Simulation error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Emergency Scenario Simulator</h3>
              <p className="text-xs text-slate-400">Test real-time IoT accident ingestion & recommendation verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 overflow-y-auto custom-scrollbar">
          <p className="text-xs text-slate-400">
            Select a verified testing scenario to immediately simulate an accident event from an on-board vehicle IoT unit:
          </p>

          <div className="space-y-2.5">
            {scenarios.map(sc => (
              <label
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                  selectedScenario === sc.id
                    ? 'bg-gradient-to-r from-red-950/40 to-slate-900 border-red-600/80 shadow-md shadow-red-950/20'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="scenario"
                      checked={selectedScenario === sc.id}
                      onChange={() => setSelectedScenario(sc.id)}
                      className="mt-1 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{sc.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sc.desc}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                        <span>Vehicle: <strong className="text-slate-200">{sc.payload.vehicleId}</strong></span>
                        <span>Severity: <strong className="text-red-400">{sc.payload.severity}</strong></span>
                        <span>Impact: <strong className="text-amber-400">{sc.payload.impactForceG}G</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{loading ? 'Transmitting IoT Telemetry...' : 'Trigger Accident Event'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
