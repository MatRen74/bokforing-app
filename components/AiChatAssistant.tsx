
import React, { useState, useEffect, useRef } from 'react';
import { LogicalIssue } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShieldExclamationIcon } from './icons/ShieldExclamationIcon';

interface AiChatAssistantProps {
  issues: LogicalIssue[];
  onAccept: () => void;
  onReject: () => void;
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const AiChatAssistant: React.FC<AiChatAssistantProps> = ({ issues, onAccept, onReject }) => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(true);
    const [aiError, setAiError] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    };
    
    // Abstracted fetch logic for reuse
    const fetchStreamedResponse = async (history: ChatMessage[], newMessage: string) => {
        setIsGenerating(true);
        setAiError('');

        const userMessage: ChatMessage = { role: 'user', text: newMessage };
        const botMessage: ChatMessage = { role: 'model', text: '' };
        
        let currentHistory = [...history];
        if(newMessage) currentHistory.push(userMessage);

        setChatHistory([...currentHistory, botMessage]);
        
        try {
            const systemInstruction = "Du är en hjälpsam och kunnig bokföringsassistent. Du analyserar logiska fel i en SIE-fil. Presentera problemen tydligt för en kompetent användare. Förklara tekniska detaljer men undvik onödigt jargong. Bjud in till dialog och svara på användarens frågor. Var koncis.";
            
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stream: true,
                    message: newMessage, // The message is now sent as part of the body
                    history: history, // Send previous history
                    systemInstruction,
                })
            });

            if (!response.ok || !response.body) {
                const errorText = await response.text();
                throw new Error(`API-fel: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                botMessage.text += decoder.decode(value, { stream: true });
                setChatHistory([...currentHistory, { ...botMessage }]);
                scrollToBottom();
            }

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Okänt fel.';
            setAiError(`Kunde inte få svar från AI:n. ${errorMsg}`);
            botMessage.text = `*Ett fel inträffade: ${errorMsg}*`;
            setChatHistory(prev => [...prev.slice(0, -1), { ...botMessage }]);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        const initialPrompt = `Här är en lista över logiska problem som hittades i en SIE-fil efter att den hade tolkats. Sammanfatta dessa problem, förklara kortfattat vad de innebär och bjud sedan in mig att ställa frågor om dem.\n\nProblem:\n${JSON.stringify(issues, null, 2)}`;
        fetchStreamedResponse([], initialPrompt);
    }, [issues]);

    useEffect(scrollToBottom, [chatHistory]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isGenerating) return;
        
        const text = userInput;
        setUserInput('');
        
        // Pass the current valid history to the fetch function
        fetchStreamedResponse(chatHistory, text);
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col h-[90vh] bg-gray-800/80 backdrop-blur-sm border border-orange-500/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-orange-500/30 flex items-center gap-4">
                <ShieldExclamationIcon className="w-8 h-8 text-orange-300 flex-shrink-0" />
                <div>
                    <h2 className="text-2xl font-bold text-orange-200">Logisk Validering</h2>
                    <p className="text-sm text-gray-300">AI-assistenten har hittat ett eller flera logiska problem i din bokföring. Chatta med AI:n för att förstå problemen.</p>
                </div>
            </div>
            
            <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>}
                        <div className={`max-w-xl p-4 rounded-xl ${msg.role === 'model' ? 'bg-gray-700' : 'bg-sky-800'}`}>
                           <p className="whitespace-pre-wrap text-white">{msg.text}</p>
                        </div>
                         {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold text-gray-300 flex-shrink-0">DU</div>}
                    </div>
                ))}
                {isGenerating && chatHistory.length > 0 && chatHistory[chatHistory.length -1].role === 'model' && (
                     <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>
                        <div className="max-w-xl p-4 rounded-xl bg-gray-700">
                           <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

             {aiError && (
                <div className="p-4 border-t border-orange-500/30">
                    <p className="text-red-400 text-sm text-center">{aiError}</p>
                </div>
            )}
            
            <form onSubmit={handleSendMessage} className="p-4 border-t border-orange-500/30 flex items-center gap-4">
                 <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={isGenerating ? "Vänta på svar..." : "Ställ en fråga om problemen..."}
                    disabled={isGenerating}
                    className="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
                />
                <button type="submit" disabled={isGenerating || !userInput.trim()} className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-md font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                    Skicka
                </button>
            </form>
             <div className="p-4 border-t border-orange-500/30 flex justify-end gap-4 bg-gray-900/50">
                <button onClick={onReject} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-md font-semibold transition-colors">
                    Börja om
                </button>
                <button onClick={onAccept} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-md font-semibold transition-colors text-white">
                    Fortsätt ändå
                </button>
            </div>
        </div>
    );
};

export default AiChatAssistant;