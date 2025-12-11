import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { InterventionForm } from './components/InterventionForm';
import { InterventionList } from './components/InterventionList';
import { Analysis } from './components/Analysis';
import { Settings } from './components/Settings';
import { User, ViewState } from './types';
import { ClipboardList, BarChart3, LogOut, PlusCircle, LayoutDashboard, LockKeyhole, Settings as SettingsIcon, Smartphone, X, Copy, Check, Globe, Rocket, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('form');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Modal State
  const [showQr, setShowQr] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('form');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleFormSuccess = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'admin';
  const isBlobUrl = currentUrl.startsWith('blob:');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="bg-slate-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard className="text-blue-400" />
            OpsLog
          </h1>
          <p className="text-xs text-slate-400 mt-1">Gestion de Maintenance</p>
        </div>
        
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="text-sm font-medium flex items-center gap-2">
            {currentUser.name}
            {isAdmin && <LockKeyhole className="w-3 h-3 text-yellow-500" />}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
            {isAdmin ? 'Administrateur' : 'Opérateur'}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setCurrentView('form')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${currentView === 'form' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>Saisir Intervention</span>
          </button>
          
          {isAdmin && (
            <>
              <button
                onClick={() => setCurrentView('list')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${currentView === 'list' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <ClipboardList className="w-5 h-5" />
                <span>Historique & Export</span>
              </button>

              <button
                onClick={() => setCurrentView('analysis')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${currentView === 'analysis' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Analyse</span>
              </button>

              <button
                onClick={() => setCurrentView('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${currentView === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <SettingsIcon className="w-5 h-5" />
                <span>Configuration</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={() => setShowQr(true)}
            className="w-full flex items-center justify-center space-x-2 text-blue-400 hover:text-blue-300 hover:bg-slate-800 py-2 rounded-lg transition text-sm"
          >
            <Smartphone className="w-4 h-4" />
            <span>Partager / Mobile</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 py-2 rounded-lg transition text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8">
           <h2 className="text-2xl font-bold text-gray-800">
             {currentView === 'form' && 'Nouveau Rapport'}
             {currentView === 'list' && 'Données d\'Intervention'}
             {currentView === 'analysis' && 'Statistiques Globales'}
             {currentView === 'settings' && 'Paramètres Application'}
           </h2>
           <p className="text-gray-500">
             {currentView === 'form' && 'Remplissez le formulaire ci-dessous pour archiver une action.'}
             {currentView === 'list' && 'Consultez, filtrez et exportez les interventions passées.'}
             {currentView === 'analysis' && 'Visualisez la répartition du travail et les tendances.'}
             {currentView === 'settings' && 'Gérez les lignes et zones disponibles pour les opérateurs.'}
           </p>
        </header>

        {currentView === 'form' && (
          <div className="max-w-6xl mx-auto">
            <InterventionForm currentUser={currentUser} onSuccess={handleFormSuccess} />
          </div>
        )}

        {currentView === 'list' && isAdmin && (
           <div className="max-w-6xl mx-auto">
            <InterventionList />
           </div>
        )}

        {currentView === 'analysis' && isAdmin && (
           <div className="max-w-6xl mx-auto">
             <Analysis />
           </div>
        )}

        {currentView === 'settings' && isAdmin && (
           <Settings />
        )}
      </main>

      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center animate-bounce z-50">
          <div className="bg-white text-green-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 font-bold">✓</div>
          Intervention enregistrée avec succès !
        </div>
      )}

      {/* Access Modal (Shared Logic) */}
      {showQr && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full relative animate-in zoom-in-95 duration-200 flex flex-col items-center">
                <button 
                    onClick={() => setShowQr(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Partage Application</h3>

                {isBlobUrl ? (
                    // Message spécifique si l'app n'est pas encore déployée
                    <div className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <h4 className="font-bold text-orange-800 text-sm mb-1">Mode Prévisualisation</h4>
                        <p className="text-xs text-orange-700 mb-3">
                           Pour partager l'application, vous devez d'abord la déployer sur un serveur (ex: Vercel).
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <Rocket className="w-3 h-3" />
                            Lien non disponible
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-gray-500 text-center mb-4">
                            Lien d'accès à l'application web.
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