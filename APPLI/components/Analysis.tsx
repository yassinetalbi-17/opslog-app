import React, { useMemo, useState } from 'react';
import { getInterventions } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, AlertTriangle, CheckCircle, TrendingUp, Clock, Filter, Activity } from 'lucide-react';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const Analysis: React.FC = () => {
  const data = getInterventions();

  // Filter States for Specific Analysis
  const [selectedLine, setSelectedLine] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Get all unique lines for the dropdown
  const allLines = useMemo(() => {
    const lines = new Set<string>();
    data.forEach(d => lines.add(d.line));
    return Array.from(lines).sort();
  }, [data]);

  // --- Global Stats Computations ---

  // 1. Total Duration per Line (Top 10)
  const durationPerLine = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(d => {
      map[d.line] = (map[d.line] || 0) + d.durationMinutes;
    });
    return Object.keys(map)
      .map(k => ({ name: k, minutes: map[k] }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 10);
  }, [data]);

  // 2. Count per Zone (Not visualized but useful for context)
  const countPerZone = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(d => {
      map[d.zone] = (map[d.zone] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  }, [data]);

  // 3. Breakdown by Day of Week (Global)
  const dayOfWeekStats = useMemo(() => {
    const stats = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    data.forEach(d => {
      const dayIndex = new Date(d.date).getDay();
      stats[dayIndex]++;
    });
    return stats.map((count, index) => ({
      day: DAYS[index],
      count: count
    })).filter((_, idx) => idx !== 0 && idx !== 6); // Filter out Sun/Sat mostly
  }, [data]);

  // 4. Preventive Maintenance Insights (Machine Health Card)
  const machineInsights = useMemo(() => {
    const machineStats: Record<string, { total: number; days: number[] }> = {};
    
    data.forEach(d => {
      if (!machineStats[d.line]) {
        machineStats[d.line] = { total: 0, days: [] };
      }
      machineStats[d.line].total++;
      machineStats[d.line].days.push(new Date(d.date).getDay());
    });

    return Object.keys(machineStats).map(line => {
      const { total, days } = machineStats[line];
      
      const dayCounts = [0,0,0,0,0,0,0];
      days.forEach(d => dayCounts[d]++);
      const maxDayVal = Math.max(...dayCounts);
      const maxDayIndex = dayCounts.indexOf(maxDayVal);
      
      let status: 'critical' | 'pattern' | 'stable' = 'stable';
      let message = "Fonctionnement normal.";

      if (total >= 5) {
        status = 'critical';
        message = "Cette machine tombe en panne très fréquemment (>5). Maintenance approfondie requise.";
      } else if (total > 1 && (maxDayVal / total) > 0.6) {
        status = 'pattern';
        message = `Tendance à casser le ${DAYS[maxDayIndex]}. Vérifier les cycles précédents ce jour.`;
      }

      return { line, total, status, message, trendDay: DAYS[maxDayIndex] };
    }).sort((a, b) => {
        if (a.status === 'critical' && b.status !== 'critical') return -1;
        if (a.status !== 'critical' && b.status === 'critical') return 1;
        if (a.status === 'pattern' && b.status === 'stable') return -1;
        if (a.status === 'stable' && b.status === 'pattern') return 1;
        return b.total - a.total;
    });
  }, [data]);

  // --- Specific Line Analysis Computations ---

  const specificStats = useMemo(() => {
    if (!selectedLine) return null;

    // Filter Data
    const filtered = data.filter(d => {
        if (d.line !== selectedLine) return false;
        if (filterStartDate && d.date < filterStartDate) return false;
        if (filterEndDate && d.date > filterEndDate) return false;
        return true;
    });

    // Initialize stats for each day: 0=Sun, 1=Mon, ..., 6=Sat
    const daysData = Array(7).fill(null).map((_, i) => ({
        day: DAYS[i],
        count: 0,
        duration: 0
    }));

    filtered.forEach(d => {
        const dayIdx = new Date(d.date).getDay();
        daysData[dayIdx].count += 1;
        daysData[dayIdx].duration += d.durationMinutes;
    });

    // Reorder to start with Monday (standard view) if preferred, or keep Sun-Sat
    // Let's filter out Sun/Sat if empty or keep full week. Keeping full week for detail.
    // Shift array to start Monday (idx 1)
    const orderedDays = [...daysData.slice(1), daysData[0]];

    return {
        totalInterventions: filtered.length,
        totalDuration: filtered.reduce((acc, c) => acc + c.durationMinutes, 0),
        chartData: orderedDays
    };
  }, [data, selectedLine, filterStartDate, filterEndDate]);

  return (
    <div className="space-y-8 pb-10">
      
      {/* KPI Summary (Global) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium uppercase">Machines Critiques</p>
                <p className="text-2xl font-bold text-gray-800">
                    {machineInsights.filter(m => m.status === 'critical').length}
                </p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
                <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium uppercase">Patterns Temporels</p>
                <p className="text-2xl font-bold text-gray-800">
                    {machineInsights.filter(m => m.status === 'pattern').length}
                </p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium uppercase">Temps d'Arrêt Total</p>
                <p className="text-2xl font-bold text-gray-800">
                    {Math.round(data.reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60)} h
                </p>
            </div>
        </div>
      </div>

      {/* NEW SECTION: Detailed Line Analysis */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
            <Activity className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-slate-800">Analyse détaillée par Machine</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sélectionner une Ligne</label>
                <select 
                    value={selectedLine}
                    onChange={(e) => setSelectedLine(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                    <option value="">-- Choisir une ligne --</option>
                    {allLines.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Du</label>
                <input 
                    type="date" 
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Au</label>
                <input 
                    type="date" 
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
        </div>

        {!selectedLine ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-lg border border-dashed border-gray-300">
                <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Veuillez sélectionner une ligne pour voir les graphiques détaillés.
            </div>
        ) : specificStats && specificStats.totalInterventions > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1: Number of breakdowns per day of week */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 text-center">Nombre de Pannes / Jour Semaine</h4>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={specificStats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" tick={{fontSize: 10}} />
                                <YAxis allowDecimals={false} />
                                <Tooltip cursor={{fill: '#f1f5f9'}} />
                                <Bar dataKey="count" name="Nombre Pannes" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-2">
                        Total Pannes: <span className="font-bold">{specificStats.totalInterventions}</span>
                    </div>
                </div>

                {/* Chart 2: Time spent per day of week */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 text-center">Temps d'Intervention / Jour Semaine (min)</h4>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={specificStats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" tick={{fontSize: 10}} />
                                <YAxis />
                                <Tooltip cursor={{fill: '#f1f5f9'}} />
                                <Bar dataKey="duration" name="Durée (min)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-2">
                        Temps Total: <span className="font-bold">{specificStats.totalDuration} min</span>
                    </div>
                </div>
            </div>
        ) : (
             <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-200">
                Aucune donnée trouvée pour cette ligne sur la période sélectionnée.
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart Global: Top Machines Downtime */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <h4 className="text-lg font-bold text-gray-800">Top Machines Global (Temps d'arrêt)</h4>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationPerLine} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11}} />
                  <Tooltip />
                  <Bar dataKey="minutes" name="Minutes" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
           {/* Preventive Recommendation Table */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Santé Parc Machine
                </h3>
                
                <div className="overflow-y-auto max-h-64">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase font-semibold sticky top-0">
                            <tr>
                                <th className="px-3 py-2">Machine</th>
                                <th className="px-3 py-2">État</th>
                                <th className="px-3 py-2">Conseil</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {machineInsights.slice(0, 10).map((m) => (
                                <tr key={m.line} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 font-bold text-gray-800">{m.line}</td>
                                    <td className="px-3 py-2">
                                        {m.status === 'critical' ? (
                                            <span className="text-red-600 font-bold">Critique</span>
                                        ) : m.status === 'pattern' ? (
                                            <span className="text-orange-600 font-bold">Cyclique</span>
                                        ) : (
                                            <span className="text-green-600">Stable</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-gray-600">{m.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
      </div>
    </div>
  );
};