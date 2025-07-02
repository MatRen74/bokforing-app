import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface ApiKeyManagerProps {
  onKeyProvided: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeyProvided }) => {
  // Vite exposes env variables prefixed with VITE_ on import.meta.env
  // For production, process.env.API_KEY would be used.
  const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;

  React.useEffect(() => {
    if (apiKey) {
      onKeyProvided();
    }
  }, [apiKey, onKeyProvided]);

  const handleSimulate = () => {
    // Simulate the presence of the key to unlock the UI for local dev without a real key.
    // This is a fallback if no VITE_API_KEY or process.env.API_KEY is found.
    Object.defineProperty(import.meta.env, 'VITE_API_KEY', { // Simulate Vite's way
        value: 'SIMULATED_KEY_EXISTS',
        writable: true,
        configurable: true
    });
    // Also simulate for process.env for broader compatibility if needed, though Vite uses import.meta.env
     Object.defineProperty(process.env, 'API_KEY', {
        value: 'SIMULATED_KEY_EXISTS',
        writable: true,
        configurable: true
    });
    onKeyProvided();
  }

  // If API key is already set (from env var), this component might not even be rendered
  // or will quickly call onKeyProvided and lead to unmounting.
  // The UI below is primarily for the simulation path.
  if (apiKey) {
    // Render nothing or a loading indicator if preferred, as onKeyProvided will be called.
    return null;
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
