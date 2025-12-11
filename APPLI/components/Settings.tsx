import React, { useState, useEffect } from 'react';
import { ZONES } from '../constants';
import { getLinesConfig, addLineToZone, removeLineFromZone, resetConfigToDefault } from '../services/storageService';
import { Plus, X, RotateCcw, Settings as SettingsIcon } from 'lucide-react';

export const Settings: React.FC = () => {
  const [config, setConfig] = useState<Record<string, string[]>>({});
  const [activeZone, setActiveZone] = useState(ZONES[0]);
  const [newLine, setNewLine] = useState('');

  const loadConfig = () => {
    setConfig(getLinesConfig());
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleAddLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLine.trim()) {
        addLineToZone(activeZone, newLine.trim());
        setNewLine('');
        loadConfig();
    }
  };

  const handleRemoveLine = (line: string) => {
    if (window.confirm(`Supprimer la ligne "${line}" de la ${activeZone} ?`)) {
        removeLineFromZone(activeZone, line);
        loadConfig();
    }
  };

  const handleReset = () => {
    if (window.confirm('Attention : Cela va restaurer la configuration des lignes par défaut. Continuer ?')) {
        resetConfigToDefault();
        loadConfig();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <SettingsIcon className="w-5 h-5 mr-2 text-gray-600" />
                        Configuration des Lignes
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Ajoutez ou supprimez les machines disponibles pour chaque zone.</p>
                </div>
                <button 
                    onClick={handleReset}
                    className="flex items-center text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded transition"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restaurer Défaut
                </button>
            </div>

            {/* Zone Selector (Tabs) */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {ZONES.map(z => (
                    <button
                        key={z}
                        onClick={() => setActiveZone(z)}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                            activeZone === z 
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {z}
                    </button>
                ))}
            </div>

            {/* Lines Management */}
            <div className="bg-gray-50 rounded-lg p-6">
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Ajouter une machine dans {activeZone}</h4>
                    <form onSubmit={handleAddLine} className="flex gap-2">
                        <input
                            type="text"
                            value={newLine}
                            onChange={(e) => setNewLine(e.target.value)}
                            placeholder="Ex: Machine 404, Ligne X..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newLine.trim()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter
                        </button>
                    </form>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Machines existantes ({config[activeZone]?.length || 0})</h4>
                    <div className="flex flex-wrap gap-2">
                        {config[activeZone]?.map(line => (
                            <div key={line} className="flex items-center bg-white border border-gray-200 text-gray-800 px-3 py-1.5 rounded-full shadow-sm">
                                <span className="text-sm font-medium mr-2">{line}</span>
                                <button
                                    onClick={() => handleRemoveLine(line)}
                                    className="text-gray-400 hover:text-red-500 transition"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        {(!config[activeZone] || config[activeZone].length === 0) && (
                            <span className="text-sm text-gray-500 italic">Aucune ligne configurée pour cette zone.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};