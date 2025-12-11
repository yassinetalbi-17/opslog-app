export enum ShiftType {
  MORNING = "05h-13h",
  AFTERNOON = "13h-21h",
  NIGHT = "21h-05h",
  DAY = "08h-16h"
}

export interface User {
  id: string;
  name: string;
  role: 'operator' | 'admin';
}

export interface Intervention {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO String
  zone: string;
  shift: ShiftType;
  line: string;
  description: string;
  durationMinutes: number;
  timestamp: number;
}

export type ViewState = 'form' | 'list' | 'analysis' | 'settings';