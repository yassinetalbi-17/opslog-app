import { Intervention } from '../types';
import { DEFAULT_ZONE_TO_LINES } from '../constants';

const STORAGE_KEY = 'opslog_interventions';
const CONFIG_KEY = 'opslog_zone_config';

// --- Interventions Management ---

export const getInterventions = (): Intervention[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveIntervention = (intervention: Intervention): void => {
  const current = getInterventions();
  const updated = [intervention, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteIntervention = (id: string): void => {
  const current = getInterventions();
  const updated = current.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

// --- Configuration Management (Zones & Lines) ---

export const getLinesConfig = (): Record<string, string[]> => {
  const data = localStorage.getItem(CONFIG_KEY);
  return data ? JSON.parse(data) : DEFAULT_ZONE_TO_LINES;
};

export const saveLinesConfig = (config: Record<string, string[]>): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const addLineToZone = (zone: string, line: string): void => {
  const config = getLinesConfig();
  const lines = config[zone] || [];
  if (!lines.includes(line)) {
    config[zone] = [...lines, line];
    saveLinesConfig(config);
  }
};

export const removeLineFromZone = (zone: string, line: string): void => {
  const config = getLinesConfig();
  const lines = config[zone] || [];
  config[zone] = lines.filter(l => l !== line);
  saveLinesConfig(config);
};

export const resetConfigToDefault = (): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_ZONE_TO_LINES));
};

// --- Exports ---

const downloadCSV = (content: string, filename: string) => {
  // Add Byte Order Mark (BOM) for Excel UTF-8 compatibility
  const bom = '\uFEFF'; 
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper to escape CSV fields for Excel (using semicolon as separator)
const toCSVField = (field: any) => {
  if (field === null || field === undefined) return '';
  const stringField = String(field);
  // Escape double quotes and wrap in quotes if necessary
  return `"${stringField.replace(/"/g, '""')}"`;
};

export const exportToCSV = (interventions: Intervention[]): void => {
  // New column order requested: Nom, Date, Jour, Shift, Zone, Ligne, Travaux, Duree
  const headers = ['Nom', 'Date', 'Jour', 'Poste', 'Zone', 'Ligne', 'Travaux effectués', 'Durée (HH:MM)'];
  
  const csvRows = [
    headers.join(';'), // Use semicolon for French Excel
    ...interventions.map(i => {
      const dateObj = new Date(i.date);
      // Format Date: JJ/MM/AAAA
      const dateStr = dateObj.toLocaleDateString('fr-FR');
      // Format Day: Lundi, Mardi...
      const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
      // Capitalize first letter of day
      const dayNameCap = dayName.charAt(0).toUpperCase() + dayName.slice(1);

      // Format Duration HH:MM
      const hours = Math.floor(i.durationMinutes / 60);
      const mins = i.durationMinutes % 60;
      const durationStr = `${hours < 10 ? '0'+hours : hours}:${mins < 10 ? '0'+mins : mins}`;

      return [
        toCSVField(i.userName),
        toCSVField(dateStr),
        toCSVField(dayNameCap),
        toCSVField(i.shift),
        toCSVField(i.zone),
        toCSVField(i.line),
        toCSVField(i.description),
        toCSVField(durationStr)
      ].join(';');
    })
  ];

  downloadCSV(csvRows.join('\n'), `rapport_interventions_${new Date().toISOString().slice(0, 10)}.csv`);
};

export const exportCriticalityCSV = (interventions: Intervention[]): void => {
  // Aggregate data by Line
  const stats: Record<string, { count: number; totalTime: number; zone: string }> = {};

  interventions.forEach(i => {
    if (!stats[i.line]) {
      stats[i.line] = { count: 0, totalTime: 0, zone: i.zone };
    }
    stats[i.line].count += 1;
    stats[i.line].totalTime += i.durationMinutes;
  });

  // Convert to array and sort by count (or total time)
  const ranking = Object.keys(stats)
    .map(line => ({
      line,
      zone: stats[line].zone,
      count: stats[line].count,
      totalTime: stats[line].totalTime,
      avgTime: (stats[line].totalTime / stats[line].count).toFixed(1)
    }))
    .sort((a, b) => b.totalTime - a.totalTime); // Sort by total downtime duration

  const headers = ['Rang', 'Ligne / Machine', 'Zone', 'Nombre Interventions', 'Temps Total (min)', 'Temps Moyen (min)'];

  const csvRows = [
    headers.join(';'),
    ...ranking.map((item, index) => [
      toCSVField(index + 1),
      toCSVField(item.line),
      toCSVField(item.zone),
      toCSVField(item.count),
      toCSVField(item.totalTime),
      toCSVField(item.avgTime.replace('.', ',')) // Replace dot with comma for French numbers
    ].join(';'))
  ];

  downloadCSV(csvRows.join('\n'), `rapport_criticite_${new Date().toISOString().slice(0, 10)}.csv`);
};