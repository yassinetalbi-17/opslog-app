import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';
import { UserCheck, Lock, Smartphone, X, Copy, Check, Globe, Rocket, AlertTriangle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showQr, setShowQr] = useState(false);
  
  // URL management
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Detect environment on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const selectedUser = MOCK_USERS.find(u => u.id === selectedId);
  const isAdminSelected = selectedUser?.role === 'admin';

  // Check if we are in a deployment environment or local preview
  const isProduction = currentUrl.startsWith('http') && !currentUrl.includes('localhost') && !currentUrl.startsWith('blob:');
  const isBlobUrl = currentUrl.startsWith('blob:');

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
      // Regular operator login
      onLogin(selectedUser);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
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

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
            <button 
                onClick={() => setShowQr(true)}
                className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition"
            >
                <Smartphone className="w-4 h-4 mr-2" />
                Installer sur Mobile
            </button>
        </div>
      </div>

      {/* Access Modal */}
      {showQr && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full relative animate-in zoom-in-95 duration-200 flex flex-col items-center">
                <button 
                    onClick={() => setShowQr(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Installation Mobile</h3>
                
                {isBlobUrl ? (
                    // Message spécifique si l'app n'est pas encore déployée
                    <div className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <h4 className="font-bold text-orange-800 text-sm mb-1">Application non déployée</h4>
                        <p className="text-xs text-orange-700 mb-3">
                            Vous utilisez actuellement une prévisualisation temporaire.
                            Pour obtenir un lien QR Code partageable, vous devez déployer cette application sur internet (ex: Vercel, Netlify).
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <Rocket className="w-3 h-3" />
                            En attente de déploiement...
                        </div>
                    </div>
                ) : (
                    // Affichage normal si l'app est déployée (ou localhost)
                    <>
                        <p className="text-xs text-gray-500 text-center mb-4">
                            Scannez ce code avec votre téléphone pour ouvrir l'application.
                        </p>

                        <div className="flex justify-center mb-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(currentUrl)}`} 
                                alt="QR Code" 
                                className="w-48 h-48"
                            />
                        </div>

                        <div className="w-full space-y-3">
                            <div className="border-t border-gray-100 pt-3">
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <input 
                                        readOnly
                                        value={currentUrl}
                                        className="bg-transparent text-xs text-blue-600 font-mono w-full outline-none"
                                    />
                                </div>
                                
                                <button 
                                    onClick={copyToClipboard}
                                    className={`mt-2 w-full flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition ${copied ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Lien copié !
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copier le lien
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}
    </div>
  );
};