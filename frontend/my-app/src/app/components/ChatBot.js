"use client"
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../utils/constants";

export default function ChatBot() {
    const { melio, setMelio } = useAuth();
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]); // Stores all messages (both user and bot)
    const [previous, setPrevious] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation]);
    const sendMessage = useCallback(async (userMessage) => {
        if (!userMessage.trim()) return;
        
        try {
            setLoading(true);
            
            // Add user message immediately for better UX
            setConversation(prev => [...prev, { from: 'user', content: userMessage }]);
            
            // Get only the user messages (last 3 max)
            const previousUserMessages = conversation
                .filter(m => m.from === 'user')
                .map(m => m.content)
                .slice(-3);  // Limit context to prevent overload
     console.log(JSON.stringify({
        message: userMessage,
        previous: previous,
        }))
            const response = await fetch(`${API_URL}/chatbot/chat/`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    previous:previous,
                })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("Bot response:", data);  // Debug log
            
            // Update context if provided, otherwise keep existing
            setPrevious(data.context );
            
            // Add bot response
            setConversation(prev => [...prev, { 
                from: 'bot', 
                content: data.response || "I didn't understand that. Could you rephrase?"
            }]);
            
        } catch (err) {
            console.error('Chat error:', err);
            setConversation(prev => [...prev, { 
                from: 'bot', 
                content: "Sorry, I'm having some trouble. Please try again later."
            }]);
        } finally {
            setLoading(false);
        }
    }, [ conversation]);
    const handleSend = () => {
        if (!message.trim() || loading) return;
        sendMessage(message);
        setMessage('');
    };

    return melio ? (
        <div className="fixed bottom-20 right-5 w-[350px] h-[500px] flex flex-col bg-white shadow-lg rounded-xl overflow-hidden z-50 border border-gray-200">
            <div className="w-full p-3 text-white text-lg bg-[var(--primary)] flex justify-between items-center">
                <span>Ask Melio</span>
                <button onClick={() => setMelio(false)} className="text-white hover:text-gray-200">
                    ×
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {conversation.map((msg, index) => (
                    <div key={index} className={`max-w-[80%] p-2 rounded-lg ${
                        msg.from === "bot" 
                            ? "bg-gray-200 text-gray-800 ml-auto" 
                            : "bg-[var(--primary)] text-white mr-auto"
                    }`}>
                        {msg.content}
                    </div>
                ))}
                {loading && (
                    <div className="max-w-[80%] p-2 rounded-lg bg-gray-200 text-gray-800 ml-auto">
                        Melio is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="p-2 border-t bg-white">
                <div className="flex gap-2">
                    <input
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        disabled={loading}
                    />
                    <button
                        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg disabled:opacity-50"
                        onClick={handleSend}
                        disabled={loading || !message.trim()}
                    >
                        {loading ? "..." : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    ) : null;
}