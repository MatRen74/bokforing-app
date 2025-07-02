import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface AiErrorAssistantProps {
  problematicLine: string;
  errorMessage: string;
  onAccept: (correctedLine: string) => void;
  onReject: () => void;
}

const AiErrorAssistant: React.FC<AiErrorAssistantProps> = ({ problematicLine, errorMessage, onAccept, onReject }) => {
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const fetchCorrection = async () => {
      setIsGenerating(true);
      setAiError('');

      try {
        const prompt = `Du är en expertanalytiker av SIE-filer. Ett parseringsfel inträffade. Din uppgift är att identifiera felet i den angivna raden och föreslå en korrigerad version. Användaren är en kompetent fackman, så ge en kortfattad, teknisk förklaring.

**Problem:** En rad från en SIE-fil kunde inte tolkas.
**Problemrad:**
\`\`\`
${problematicLine}
\`\`\`
**Felmeddelande från parsern:**
\`\`\`
${errorMessage}
\`\`\`

**Uppgift:**
Generera en JSON-utdata med följande struktur:
{
  "analysis": "En kort teknisk förklaring av problemet (t.ex. 'Beloppet \\"-9,525.00\\" innehåller ett ogiltigt tusentalsavgränsande kommatecken.').",
  "correctedLine": "ENDAST den fullständiga, korrigerade #TRANS-raden, utan extra text eller markdown."
}`;

        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: prompt,
                stream: false, // We want a single JSON response
                config: {
                    responseMimeType: "application/json",
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ details: 'Kunde inte läsa felmeddelande.'}));
            throw new Error(`API-fel: ${response.status} ${response.statusText} - ${errorData.details}`);
        }

        const parsedData = await response.json();
        
        if (parsedData.error) {
             throw new Error(`AI-svar innehöll ett fel: ${parsedData.details}`);
        }

        if (parsedData.analysis && parsedData.correctedLine) {
          setAiAnalysis(parsedData.analysis);
          setAiSuggestion(parsedData.correctedLine);
        } else {
          throw new Error("AI-svaret hade ett oväntat format.");
        }

      } catch (err) {
        console.error("Error fetching AI correction:", err);
        const errorMsg = err instanceof Error ? err.message : 'Ett okänt fel inträffade.';
        setAiError(`Kunde inte få förslag från AI:n. ${errorMsg}`);
      } finally {
        setIsGenerating(false);
      }
    };

    fetchCorrection();
  }, [problematicLine, errorMessage]);

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-gray-800/80 backdrop-blur-sm border border-yellow-500/50 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-4 mb-4">
        <SparklesIcon className="w-8 h-8 text-yellow-300" />
        <h2 className="text-2xl font-bold text-yellow-200">AI-assisterad felkorrigering</h2>
      </div>
      <p className="text-gray-300 mb-6">Parsern stötte på ett problem och kunde inte tolka en rad i filen. AI-assistenten har analyserat problemet och föreslår en korrigering.</p>
      
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h4 className="font-semibold text-gray-400 mb-2">Parserns felmeddelande:</h4>
        <p className="text-red-400 font-mono text-sm">{errorMessage}</p>
      </div>

      {isGenerating && (
        <div className="text-center py-8">
            <div role="status" className="flex items-center justify-center gap-2 text-lg text-gray-300">
                <svg aria-hidden="true" className="w-6 h-6 animate-spin text-sky-500 fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5424 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="animate-pulse">AI:n analyserar problemet...</span>
            </div>
        </div>
      )}

      {aiError && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-300 font-semibold">Fel vid AI-analys</p>
            <p className="text-red-400 text-sm">{aiError}</p>
        </div>
      )}

      {!isGenerating && !aiError && aiSuggestion && (
        <div>
          <div className="bg-gray-900 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-400 mb-2">AI:ns analys:</h4>
              <p className="text-gray-300">{aiAnalysis}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Originalrad</label>
              <pre className="p-3 bg-red-900/30 text-red-300 rounded-md text-xs overflow-x-auto"><code>{problematicLine}</code></pre>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">AI-förslag</label>
              <pre className="p-3 bg-green-900/30 text-green-300 rounded-md text-xs overflow-x-auto"><code>{aiSuggestion}</code></pre>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={onReject}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-md font-semibold transition-colors"
            >
              Avbryt
            </button>
            <button
              onClick={() => onAccept(aiSuggestion)}
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md font-semibold transition-colors text-white flex items-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Godkänn förslag
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiErrorAssistant;