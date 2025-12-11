import { User, ShiftType } from './types';

export const MOCK_USERS: User[] = [
  // Admin
  { id: 'admin_01', name: 'ADMINISTRATEUR', role: 'admin' },
  
  // Operators List 1
  { id: 'u1', name: 'CATHERINE JEAN', role: 'operator' },
  { id: 'u2', name: 'DUBOSQ GREGORY', role: 'operator' },
  { id: 'u3', name: 'HUBERT SEBASTIEN', role: 'operator' },
  { id: 'u4', name: 'LACOMBE ROMAIN', role: 'operator' },
  { id: 'u5', name: 'LEBOISSELIER JEROME', role: 'operator' },
  { id: 'u6', name: 'LEVALOT JULIEN', role: 'operator' },
  { id: 'u7', name: 'PICHON JULES', role: 'operator' },
  { id: 'u8', name: 'TRAVERT MARIN', role: 'operator' },
  
  // Operators List 2
  { id: 'u9', name: 'ABDELRHANI EL IDRISSI AYOUB', role: 'operator' },
  { id: 'u10', name: 'DESHAYES AURELIEN', role: 'operator' },
  { id: 'u11', name: 'DUSSARD BRYAN', role: 'operator' },
  { id: 'u12', name: 'DUVAL AYMERIC', role: 'operator' },
  { id: 'u13', name: 'LAMARE ROMAIN', role: 'operator' },
  { id: 'u14', name: 'LE BITOUZE FLOYAN', role: 'operator' },
  { id: 'u15', name: 'LECONTE LUDOVIC', role: 'operator' },
  { id: 'u16', name: 'LEMAGNEN RENOUF LUCAS', role: 'operator' },
  { id: 'u17', name: 'LEREVEREND ANTOINE', role: 'operator' },
  { id: 'u18', name: 'LETERRIER JEREMY', role: 'operator' },
  { id: 'u19', name: 'LEVEZIEL THIERRY', role: 'operator' },
  { id: 'u20', name: 'MARIETTE LUCAS', role: 'operator' },
  { id: 'u21', name: 'MOTTE VALENTIN', role: 'operator' },
  { id: 'u22', name: 'RIDEL RENAUD', role: 'operator' },
  { id: 'u23', name: 'TEKKOUK TONY', role: 'operator' },
  { id: 'u24', name: 'VIEL FABIEN', role: 'operator' },
];

export const ZONES = [
  "Zone 1",
  "Zone 2",
  "Zone 3"
];

// Default Mapping (Initial State)
export const DEFAULT_ZONE_TO_LINES: Record<string, string[]> = {
  "Zone 1": [
    "758", "604", "603", "268", "752", 
    "753", "106", "602", "401", "402"
  ],
  "Zone 2": [
    "403", "253", "262", "751", "756", 
    "104", "384", "406", "404", "382", 
    "750", "601"
  ],
  "Zone 3": [
    "383", "111", "760", "757", "754", 
    "759", "216", "234", "Sx7", "Sx8", "351"
  ]
};

export const SHIFTS = [
  ShiftType.MORNING,
  ShiftType.DAY,
  ShiftType.AFTERNOON,
  ShiftType.NIGHT
];