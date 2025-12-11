import React, { useState, useEffect, useMemo } from 'react';
import { User, ShiftType, Intervention } from '../types';
import { ZONES, SHIFTS } from '../constants';
import { saveIntervention, getLinesConfig, getInterventions } from '../services/storageService';
import { Save, Loader2, AlertTriangle, TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface InterventionFormProps {
  currentUser: User;
  onSuccess: () => void;
}

export const InterventionForm: React.FC<InterventionFormProps> = ({ currentUser, onSuccess }) => {
  const [zoneToLines, setZoneToLines] = useState(getLinesConfig());
  const [zone, setZone] = useState(ZONES[0]);
  const [shift, setShift] = useState<ShiftType>(SHIFTS[0]);
  
  // Initialize line with the first line of the first zone
  const [line, setLine] = useState('');
  
  // Duration state in minutes (default 30 min)
  const [duration, setDuration] = useState<number>(30);
  
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Derived state for HH:MM display
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  // Load config on mount
  useEffect(() => {
    const config = getLinesConfig();
    setZoneToLines(config);
    if (config[ZONES[0]]?.length > 0) {
        setLine(config[ZONES[0]][0]);
    }
  }, []);

  // When Zone changes, update available Lines and select the first one
  const handleZoneChange = (newZone: string) => {
    setZone(newZone);
    const availableLines = zoneToLines[newZone] || [];
    if (availableLines.length > 0) {
      setLine(availableLines[0]);
    } else {
      setLine('');
    }
  };

  const handleDurationChange = (newHours: number, newMinutes: number) => {
    // Max duration rule: 7 hours (420 minutes)
    // If user selects 7 hours, force minutes to 0
    if (newHours === 7) {
        setDuration(420);
    } else {
        setDuration((newHours * 60) + newMinutes);
    }
  };

  const availableLines = zoneToLines[zone] || [];

  // Calculate Critical Lines (Top 3 by frequency)
  const criticalLines = useMemo(() => {
    const all = getInterventions();
    const counts: Record<string, number> = {};
    const duration: Record<string, number> = {};

    all.forEach(i => {
        counts[i.line] = (counts[i.line] || 0) + 1;
        duration[i.line] = (duration[i.line] || 0) + i.durationMinutes;
    });
    
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1]) // Sort by frequency
        .slice(0, 3)
        .map(([l, count]) => ({ line: l, count, totalDuration: duration[l] }));
  }, []); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Manual Validation
    if (!line) {
        setFormError("Veuillez sélectionner une Ligne / Machine.");
        return;
    }
    if (!description.trim()) {
        setFormError("Veuillez saisir un descriptif des travaux.");
        return;
    }
    if (duration <= 0) {
        setFormError("La durée de l'intervention ne peut pas être nulle.");
        return;
    }

    setIsSaving(true);
    
    // Simulate slight delay for UX
    setTimeout(() => {
        const newIntervention: Intervention = {
          id: crypto.randomUUID(),
          userId: currentUser.id,
          userName: currentUser.name,
          date,
          zone,
          shift,
          line,
          description,
          durationMinutes: duration,
          timestamp: Date.now()
        };
    
        saveIntervention(newIntervention);
        setIsSaving(false);
        onSuccess();
        // Reset form content (but keep context like zone/shift)
        setDescription('');
        setDuration(30);
    }, 600);
  };

  return (
    <div className="space-y-8">
        {/* Top Criticality Section - High Visibility */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-500 text-white p-2 rounded-lg">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-lg text-orange-900">Attention : Machines Critiques</h4>
                    <p className="text-sm text-orange-800">
                        Ces équipements ont subi le plus de pannes récemment. Une attention particulière est requise.
                    </p>
                </div>
            </div>
            
            {criticalLines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {criticalLines.map((item, idx) => (
                        <div key={item.line} className="bg-white/80 backdrop-blur p-4 rounded-lg shadow-sm border border-orange-200 flex flex-col items-center text-center">
                            <div className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-1">Priorité #{idx + 1}</div>
                            <span className="font-bold text-xl text-gray-800 mb-1">{item.line}</span>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span><span className="font-bold">{item.count}</span> Pannes</span>
                                <span><span className="font-bold">{item.totalDuration}min</span> Arrêt total</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center bg-white/50 p-4 rounded-lg border border-orange-200 border-dashed">
                     <p className="text-sm text-gray-500 italic flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Collecte des données en cours pour établir le classement.
                     </p>
                </div>
            )}
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm font-bold shadow-md shadow-blue-200">1</span>
                Saisir une nouvelle intervention
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date d'intervention</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Poste (Shift)</label>
                            <select
                                value={shift}
                                onChange={(e) => setShift(e.target.value as ShiftType)}
                                className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                            >
                                {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Zone Attitrée</label>
                            <select
                                value={zone}
                                onChange={(e) => handleZoneChange(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                            >
                                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ligne / Outil</label>
                            <select
                                value={line}
                                onChange={(e) => setLine(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                disabled={availableLines.length === 0}
                            >
                                {availableLines.length === 0 && <option value="">Aucune ligne disponible</option>}
                                {availableLines.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                     <label className="block text-sm font-semibold text-gray-700 mb-3">Durée de l'intervention (Max 7h)</label>
                     <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <Clock className="w-6 h-6 text-blue-500" />
                        
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <label className="text-xs text-blue-800 font-semibold uppercase mb-1">Heures</label>
                                <select 
                                    value={hours}
                                    onChange={(e) => handleDurationChange(parseInt(e.target.value), minutes)}
                                    className="h-12 w-20 text-center text-lg font-bold text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map(h => (
                                        <option key={h} value={h}>{h} h</option>
                                    ))}
                                </select>
                            </div>
                            
                            <span className="text-2xl font-bold text-gray-400 mt-4">:</span>

                            <div className="flex flex-col">
                                <label className="text-xs text-blue-800 font-semibold uppercase mb-1">Minutes</label>
                                <select 
                                    value={minutes}
                                    onChange={(e) => handleDurationChange(hours, parseInt(e.target.value))}
                                    disabled={hours === 7}
                                    className="h-12 w-20 text-center text-lg font-bold text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                                        <option key={m} value={m}>{m < 10 ? `0${m}` : m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="ml-auto text-sm text-blue-700 font-medium hidden sm:block">
                            Temps total : {duration} min
                        </div>
                     </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Descriptif des travaux</label>
                    </div>
                    <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Décrivez l'intervention, la cause racine et la solution apportée..."
                        className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                    />
                </div>

                {/* Error Message */}
                {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center animate-shake">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {formError}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 hover:shadow-blue-300 disabled:opacity-70 disabled:shadow-none"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Enregistrer l'intervention
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};