
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
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
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(true);
    const [aiError, setAiError] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {
        const initializeChat = async () => {
            setIsGenerating(true);
            setAiError('');

            if (!process.env.API_KEY) {
                setAiError("API-nyckel för Gemini saknas.");
                setIsGenerating(false);
                return;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const newChat = ai.chats.create({
                    model: 'gemini-2.5-flash-preview-04-17',
                    config: {
                      systemInstruction: "Du är en hjälpsam och kunnig bokföringsassistent. Du analyserar logiska fel i en SIE-fil. Presentera problemen tydligt för en kompetent användare. Förklara tekniska detaljer men undvik onödigt jargong. Bjud in till dialog och svara på användarens frågor. Var koncis."
                    },
                });
                setChat(newChat);

                const initialPrompt = `Här är en lista över logiska problem som hittades i en SIE-fil efter att den hade tolkats. Sammanfatta dessa problem, förklara kortfattat vad de innebär och bjud sedan in mig att ställa frågor om dem.\n\nProblem:\n${JSON.stringify(issues, null, 2)}`;

                const initialBotMessage: ChatMessage = { role: 'model', text: '' };
                setChatHistory([initialBotMessage]);
                
                const response = await newChat.sendMessageStream({ message: initialPrompt });

                for await (const chunk of response) {
                    initialBotMessage.text += chunk.text;
                    setChatHistory(prev => [...prev.slice(0, -1), { ...initialBotMessage }]);
                }

            } catch (err) {
                 const errorMsg = err instanceof Error ? err.message : 'Ett okänt fel inträffade.';
                 setAiError(`Kunde inte starta chatt-assistenten. ${errorMsg}`);
            } finally {
                setIsGenerating(false);
            }
        };

        initializeChat();
    }, [issues]);

    useEffect(scrollToBottom, [chatHistory]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chat || isGenerating) return;

        const text = userInput;
        setUserInput('');
        const userMessage: ChatMessage = { role: 'user', text };
        const botMessage: ChatMessage = { role: 'model', text: '' };
        setChatHistory(prev => [...prev, userMessage, botMessage]);
        setIsGenerating(true);
        setAiError('');

        try {
            const response = await chat.sendMessageStream({ message: text });
            for await (const chunk of response) {
                botMessage.text += chunk.text;
                setChatHistory(prev => [...prev.slice(0, -1), { ...botMessage }]);
            }
        } catch(err) {
            const errorMsg = err instanceof Error ? err.message : 'Okänt fel.';
            setAiError(`Kunde inte få svar från AI:n. ${errorMsg}`);
            botMessage.text = `*Ett fel inträffade: ${errorMsg}*`;
            setChatHistory(prev => [...prev.slice(0, -1), { ...botMessage }]);
        } finally {
            setIsGenerating(false);
        }
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
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>}
                        <div className={`max-w-xl p-4 rounded-xl ${msg.role === 'model' ? 'bg-gray-700' : 'bg-sky-800'}`}>
                           <p className="whitespace-pre-wrap text-white">{msg.text}</p>
                        </div>
                         {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0"></div>}
                    </div>
                ))}
                {isGenerating && chatHistory.length > 0 && chatHistory[chatHistory.length -1].role === 'model' && (
                     <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>
                        <div className="max-w-xl p-4 rounded-xl bg-gray-700 animate-pulse">
                            <div className="h-2 bg-gray-500 rounded-full w-48"></div>
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
