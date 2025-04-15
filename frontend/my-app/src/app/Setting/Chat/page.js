"use client"

import { useState, useEffect, useRef } from 'react';
import { useForm } from '@/app/context/FormContext';
import Pusher from 'pusher-js';
import { API_URL } from '@/app/utils/constants';
import { getMyProfile } from '@/app/utils/auth';

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [username, setUsername] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const chatDisplayRef = useRef(null);

    // Fetch username and previous messages
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getMyProfile();
                if (response.success) {
                    const cleanUsername = response.profile.username.replace(/\s+/g, "_");
                    setUsername(cleanUsername);
                    
                    // Fetch previous messages
                    const token = localStorage.getItem('access_token');
                    const messagesRes = await fetch(`${API_URL}/get_messages/?username=${cleanUsername}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (messagesRes.ok) {
                        const messagesData = await messagesRes.json();
                        setMessages(messagesData);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    // Subscribe to Pusher when username is available
    useEffect(() => {
        if (!username) return;

        const pusher = new Pusher('4b8aedc65def2e33fdf6', {
            cluster: 'eu',
            forceTLS: true
        });

        const channel = pusher.subscribe(`chat-client-${username.replace(/\s+/g, "_")}`);
        
        channel.bind('message', (data) => {
            setMessages((prev) => [...prev, data]);
            setIsConnected(true);
        });

        pusher.connection.bind('state_change', (states) => {
            setIsConnected(states.current === 'connected');
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, [username]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (chatDisplayRef.current) {
            chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
        }
    }, [messages]);

    const submit = async (e) => {
        e.preventDefault();
        if (!username || !message.trim()) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/messages/`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
            

            if (response.ok) {
                setMessage("");
            } else {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message");
        }
    };

    return (
        <div className="w-full rounded-xl flex flex-row gap-14 px-16">
            <div className="w-full mx-auto bg-white dark:bg-zinc-800 shadow-md rounded-lg overflow-hidden">
                <div className="flex flex-col min-h-[400px]">
                    <div className="px-4 py-3 border-b dark:border-zinc-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">
                            Messages
                        </h2>
                        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                             title={isConnected ? 'Connected' : 'Disconnected'}></div>
                    </div>
                    <div 
                        ref={chatDisplayRef}
                        className="flex-1 p-3 overflow-y-auto flex flex-col space-y-2"
                    >
                        {messages.length > 0 ? (
                            messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`flex flex-col ${msg.username === username ? 'items-end' : 'items-start'}`}
                                >
                                    <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg 
                                        bg-blue-100 dark:bg-blue-900 text-zinc-800 dark:text-white">
                                        <div className="font-semibold text-sm">{msg.username}</div>
                                        <div className="text-sm mt-1">{msg.message}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex justify-center items-center h-full text-zinc-500 dark:text-zinc-400">
                                No messages yet
                            </div>
                        )}
                    </div>
                    <div className="px-3 py-2 border-t dark:border-zinc-700">
                        <form onSubmit={submit} className="flex gap-2">
                            <input 
                                placeholder="Type your message..." 
                                className="flex-1 p-2 border rounded-lg dark:bg-zinc-700 dark:text-white dark:border-zinc-600 text-sm" 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && submit(e)}
                            />
                            <button 
                                type="submit" 
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg transition duration-300 ease-in-out text-sm"
                                disabled={!message.trim()}
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}