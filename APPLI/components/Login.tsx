import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';
import { UserCheck, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const selectedUser = MOCK_USERS.find(u => u.id === selectedId);
  const isAdminSelected = selectedUser?.role === 'admin';

  const handleLogin = () => {
    setError('');
    
    if (!selectedUser) return;

    if (isAdminSelected) {
      if (password === 'MLC2025-2026') {
        onLogin(selectedUser);
      } else {
        setError('Mot de passe incorrect');
      }
    } else {
      // Regular operator login (no password needed based on requirements)
      onLogin(selectedUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <UserCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Bienvenue sur OpsLog</h2>
        <p className="text-center text-gray-500 mb-8">Veuillez sélectionner votre profil</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identité</label>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setPassword('');
                setError('');
              }}
              className="w-full border-gray-300 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Choisir un profil --</option>
              {MOCK_USERS.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {isAdminSelected && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe Admin</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe requis"
                  className="w-full pl-10 border-gray-300 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={!selectedId}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
};