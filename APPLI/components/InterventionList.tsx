import React, { useMemo, useState, useEffect } from 'react';
import { Intervention } from '../types';
import { getInterventions, exportToCSV, exportCriticalityCSV, deleteIntervention } from '../services/storageService';
import { Download, Search, Trash2, FileBarChart } from 'lucide-react';

export const InterventionList: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  // Initial load
  useEffect(() => {
    setInterventions(getInterventions());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
        deleteIntervention(id);
        setInterventions(getInterventions()); // Reload
    }
  };

  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    }
    return `${minutes} min`;
  };

  const filteredData = useMemo(() => {
    return interventions.filter(i => {
      const matchDate = (!startDate || i.date >= startDate) && (!endDate || i.date <= endDate);
      const matchSearch = 
        i.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        i.line.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchDate && matchSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [interventions, startDate, endDate, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Historique des Interventions</h3>
          <div className="flex gap-2">
            <button
                onClick={() => exportCriticalityCSV(filteredData)}
                className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                title="Génère un tableau des machines les plus critiques"
            >
                <FileBarChart className="w-4 h-4 mr-2" />
                Rapport Criticité
            </button>
            <button
                onClick={() => exportToCSV(filteredData)}
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
                <Download className="w-4 h-4 mr-2" />
                Export Données
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Du</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded p-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
             <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Au</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded p-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
           <div>
             <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Recherche</label>
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Opérateur, Ligne, Description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 bg-white border border-gray-300 rounded p-2 text-sm outline-none focus:border-blue-500"
                />
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Date</th>
                <th className="px-4 py-3">Opérateur</th>
                <th className="px-4 py-3">Poste</th>
                <th className="px-4 py-3">Ligne / Zone</th>
                <th className="px-4 py-3">Durée</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 rounded-tr-lg w-10">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Aucune intervention trouvée pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition group">
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.userName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                        {item.shift}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{item.line}</div>
                      <div className="text-xs text-gray-500">{item.zone}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-blue-700 font-medium">
                      {formatDuration(item.durationMinutes)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={item.description}>
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-center">
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                            title="Supprimer cette ligne"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};