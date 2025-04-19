"use client"

import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { API_URL } from '@/app/utils/constants';
import { getMyProfile } from '@/app/utils/auth';

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Setup Pusher
    /*useEffect(() => {
        const pusher = new Pusher('4b8aedc65def2e33fdf6', {
            cluster: 'eu',
            forceTLS: true
        });

        if (conversationId) {
            const channel = pusher.subscribe(`conversation-${conversationId}`);
            channel.bind('new-message', (data) => {
                setMessages(prev => [...prev, data]);
            });

            return () => {
                channel.unbind_all();
                channel.unsubscribe();
                pusher.disconnect();
            };
        }
    }, [conversationId]);
*/
    // Fetch user and conversations
    useEffect(() => {
        async function fetchConversations() {
            try {
                const responseUser = await getMyProfile();
                setUser(responseUser.profile);
                console.log(responseUser.token + " " + responseUser.profile);

                const response = await fetch(`${API_URL}/conversations/`, {
                    headers: {
                        'Authorization': `Bearer ${responseUser.token}`
                    }
                });


                const data = await response.json();
                setConversations(data);
            } catch (err) {
                setError(err.message);
            }
        }

        fetchConversations();
    }, []);

    /*// Fetch messages for the current conversation
    useEffect(() => {

        async function fetchMessages() {
            try {
                const responseUser = await getMyProfile();
                const response = await fetch(`${API_URL}/messages/${conversationId}/`, {
                    headers: {
                        'Authorization': `Bearer ${responseUser.token}`
                    },
                });

                
                if (!response.ok) {
                    console.log('Failed to fetch messages' , response);
                }else{
                const data = await response.json();
                setMessages(data);}
            } catch (err) {
                setError(err.message);
            }
        }

        fetchMessages();
    }, [conversationId]);
*/
    async function createConversation() {
        try {
            const responseUser = await getMyProfile();
            const response = await fetch(`${API_URL}/create-conversation/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${responseUser.token}`
                },
                body: JSON.stringify({
                    cust: responseUser.profile.id,
                    user: responseUser.profile
                })
            });

            if (!response.ok) {
                setError('Failed to create conversation');
            }

            const data = await response.json();
            setConversations(prev => [...prev, data]);
        } catch (err) {
            setError(err.message);
        }
    }
/*
    async function sendMessage(e) {
        e.preventDefault();
        if (!message.trim() || !conversationId || !user) return;

        try {
            const responseUser = await getMyProfile();
            const response = await fetch(`${API_URL}/messages/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${responseUser.token}`
                },
                body: JSON.stringify({
                    conversation: conversationId,
                    content: message,
                    sender: user.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            setMessage("");
        } catch (err) {
            setError(err.message);
        }
    }
*/
    const ConversationBox = ({ conversation }) => {
        return (
            <div
                className={`p-3 rounded-lg cursor-pointer ${
                    'bg-blue-500 text-white'
                    }`}
            >
                <p className="font-medium">Staff Chat</p>
            </div>
        );
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <div className="w-full min-h-[40vh] rounded-xl flex">
            {/* Sidebar */}
            <div className="w-1/3 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-4 space-y-4 border-r border-zinc-300 dark:border-zinc-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Conversations</h2>
                    {conversations.length === 0 && (
                        <button
                            onClick={createConversation}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                        >
                            + New
                        </button>
                    )}
                </div>
                <div className="space-y-2">
                    {conversations.map((conv , index) => (
                        <ConversationBox key={index} conversation={conv} />
                    ))}
                </div>
            </div>

            {/* Chat area 
            <div className="w-2/3 flex flex-col">
                <>
                        <div className="flex-1 p-4 overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No messages yet</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`mb-3 ${
                                            msg.sender === user?.id ? 'text-right' : 'text-left'
                                        }`}
                                    >
                                        <div
                                            className={`inline-block p-3 rounded-lg ${
                                                msg.sender === user?.id
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-zinc-200 dark:bg-zinc-700'
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/*<form onSubmit={sendMessage} className="p-4 border-t">
                            <div className="flex gap-2">
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 p-2 border rounded"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </>
                
            </div>*/}
        </div>
    );
}
