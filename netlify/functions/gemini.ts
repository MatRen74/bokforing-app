import { GoogleGenAI, Content } from "@google/genai";

// Define the structure of a chat message for type safety
interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// Define the expected structure of the request body
interface RequestBody {
    stream?: boolean;
    message: string;
    history?: ChatMessage[];
    systemInstruction?: string;
    config?: any; // To pass model configs like responseMimeType
}

// Helper to format chat history for the Gemini API
const formatHistory = (history: ChatMessage[] = []): Content[] => {
    return history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));
};

// Main Netlify Edge Function handler
export default async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
            status: 405, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key is not configured on the server.' }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    try {
        const body: RequestBody = await req.json();
        const ai = new GoogleGenAI({ apiKey });

        if (body.stream) {
            // --- Streaming Chat Logic ---
            const contents = formatHistory(body.history);
            // Add the new user message to the contents
            contents.push({ role: 'user', parts: [{ text: body.message }] });

            const result = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash-preview-04-17',
                contents,
                config: {
                   systemInstruction: body.systemInstruction || undefined
                }
            });

            // Pipe the stream from Gemini API to the client
            const stream = new ReadableStream({
                async start(controller) {
                    for await (const chunk of result) {
                        const text = chunk.text;
                        if (text) {
                            controller.enqueue(new TextEncoder().encode(text));
                        }
                    }
                    controller.close();
                },
            });
            return new Response(stream, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });

        } else {
            // --- Non-streaming Request/Response Logic ---
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-04-17',
                contents: body.message, // For single-turn, contents can be just a string
                config: body.config || undefined,
            });
            
            let jsonStr = response.text.trim();
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = jsonStr.match(fenceRegex);
            if (match && match[2]) {
              jsonStr = match[2].trim();
            }

            try {
              // The client expects a JSON object, so we parse it here and re-stringify
              // to ensure we send a valid JSON response.
              const parsedJson = JSON.parse(jsonStr);
              return new Response(JSON.stringify(parsedJson), {
                  headers: { 'Content-Type': 'application/json' },
              });
            } catch (e) {
              console.error("Failed to parse JSON from AI response:", e);
              return new Response(JSON.stringify({ error: 'Failed to parse JSON response from AI', details: jsonStr }), { status: 500, headers: { 'Content-Type': 'application/json' } });
            }
        }

    } catch (error) {
        console.error('Error in Gemini proxy function:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return new Response(JSON.stringify({ error: 'Failed to process AI request.', details: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

// Configuration for Netlify to treat this as an Edge Function
export const config = {
    path: "/api/gemini",
};
