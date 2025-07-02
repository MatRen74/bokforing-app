import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface ApiKeyManagerProps {
  onKeyProvided: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeyProvided }) => {
  const handleSimulate = () => {
    // In a real application, this would be handled server-side or via environment variables.
    // Here, we simulate the presence of the key to unlock the UI.
    // The key is NOT stored, it's just a flag to proceed.
    Object.defineProperty(process.env, 'API_KEY', {
        value: 'SIMULATED_KEY_EXISTS',
        writable: true
    });
    onKeyProvided();
  }

  return (
    <div className="w-full max-w-lg text-center p-8 bg-gray-800 rounded-2xl shadow-xl border border-sky-500/30">
        <SparklesIcon className="w-16 h-16 mx-auto text-sky-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Aktivera AI-assistenten</h1>
        <p className="text-gray-400 mb-6">
            För att använda de intelligenta analysfunktionerna krävs en Google Gemini API-nyckel.
        </p>

        <div className="text-left bg-gray-900 p-4 rounded-lg mb-6 border border-gray-700">
            <h3 className="font-semibold text-gray-200">Säkerhet och API-nycklar</h3>
            <p className="text-xs text-gray-500 mt-1">
                Av säkerhetsskäl får en API-nyckel aldrig klistras in direkt i en webbapp.
                I en produktionsmiljö hämtas nyckeln säkert från en miljövariabel på servern (`process.env.API_KEY`).
            </p>
        </div>
      
        <p className="text-gray-400 mb-6">
            För att testa i den här demomiljön, klicka nedan för att simulera att en giltig nyckel finns.
        </p>

        <button
          onClick={handleSimulate}
          className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 rounded-md font-semibold transition-colors text-lg flex items-center justify-center gap-2"
        >
            <SparklesIcon className="w-6 h-6" />
            Simulera API-nyckel & Starta Analys
        </button>
    </div>
  );
};

export default ApiKeyManager;
