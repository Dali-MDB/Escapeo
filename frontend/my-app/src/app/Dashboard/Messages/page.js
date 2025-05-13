"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '@/app/utils/constants';

export default function Messages() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [acceptingId, setAcceptingId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState(() => {
        return localStorage.getItem('lastSelectedConversationId') || null;
    });
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const [conversations, setConversations] = useState([]);
    const [message, setMessage] = useState("");
    const [wsInfo, setWsInfo] = useState(null);

    const acceptTicket = async (ticketId) => {
        try {
            setAcceptingId(ticketId);
            const response = await fetch(`${API_URL}/chat/support-tickets/${ticketId}/accept/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
            });
            if (!response.ok) throw new Error("Failed to accept ticket");
            await fetchTickets();
            await fetchConversations();
        } catch (err) {
            setError(err.message);
        } finally {
            setAcceptingId(null);
        }
    };

    const getSocketInfo = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/chat/ws-info/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching WebSocket info:', error);
            return null;
        }
    }, []);





   
    const initWebSocket = useCallback(async (conversationId) => {
        if (!conversationId) return;

        try {
            const info = await getSocketInfo();
            if (!info) throw new Error("Failed to get WebSocket info");

            setWsInfo(info);
            const token = localStorage.getItem("accessToken");
            const wsUrl = `${info.direct_chat.url.replace('<conversation_id>', conversationId)}?token=${token}`;
            const newSocket = new WebSocket(wsUrl);

            newSocket.onopen = () => {
                setSocket(newSocket);
                console.log('WebSocket connected');
            };

            newSocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "message") {
                        setMessages(prev => {
                            const currentMessages = Array.isArray(prev) ? prev : [];

                            // Check if message already exists
                            if (!currentMessages.some(msg => msg.id === data.id)) {
                                const updatedMessages = [...currentMessages, {
                                    id: data.id,
                                    message: data.content,
                                    sender: data.sender,
                                    timestamp: data.timestamp
                                }];

                                localStorage.setItem(`chatMessages-${conversationId}`, JSON.stringify(updatedMessages));
                                return updatedMessages;
                            }
                            return currentMessages;
                        });
                    }

                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            };

            

            newSocket.onclose = (event) => {
                
            };

            return newSocket;
        } catch (error) {
            console.error('WebSocket initialization error:', error);
            setError("Failed to initialize WebSocket");
            return null;
        }
    }, [getSocketInfo]);

    useEffect(() => {
        //        localStorage.clear()
        if (socket) {
            if (socket.readyState === 1) {
                console.log('WebSocket is properly connected');
            }
        }
    }, [socket]);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/chat/support-tickets/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
            });
            if (!response.ok) throw new Error("Failed to fetch tickets");
            const data = await response.json();
            setTickets(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchConversations = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/chat/direct-conversations/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
            });
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (err) {
            setError("Failed to load conversations");
        }
    }, []);

    const fetchConversationMessages = useCallback(async (id) => {
        try {
            const cachedMessages = localStorage.getItem(`chatMessages-${id}`);
            if (cachedMessages) {
                setMessages(JSON.parse(cachedMessages));
            } else {
                setMessages([]);
            }

            const response = await fetch(`${API_URL}/chat/direct-conversations/${id}/messages/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setMessages(data);
                    localStorage.setItem(`chatMessages-${id}`, JSON.stringify(data));
                }
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    }, []);

    const sendMessage = useCallback(async () => {
        if (!message.trim() || !conversationId || !socket) return;

        const tempId = Date.now();
        const tempMessage = {
            id: tempId,
            message: message,
            sender: { username: "you" }, // Temporary sender info
            timestamp: new Date().toISOString(),
            isTemp: true

        };

        
        setMessage("");
            
        try {
            
            const messageData = {
                "action": "send",
                'message': message,
            };

            console.log(JSON.stringify(messageData))
            socket.send(JSON.stringify(messageData));

        } catch (err) {
            console.error("Send error:", err);
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    }, [message, conversationId, socket, wsInfo, conversations]);

    const selectConversation = useCallback((id) => {
        setConversationId(id);
        localStorage.setItem('lastSelectedConversationId', id);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        fetchTickets();
        fetchConversations();
    }, [fetchTickets, fetchConversations]);

    useEffect(() => {
        let currentSocket = null;

        const setupWebSocket = async () => {
            if (conversationId) {
                currentSocket = await initWebSocket(conversationId);
                fetchConversationMessages(conversationId);
            }
        };

        setupWebSocket();

        return () => {
            if (currentSocket) {
                currentSocket.close();
            }
        };
    }, [conversationId, initWebSocket, fetchConversationMessages]);

    return (
        <div className="w-full min-h-[40vh] rounded-xl flex gap-6">
            <div className="w-1/2 h-fit rounded-xl bg-[var(--bg-color)] dark:bg-zinc-900 p-4 space-y-4 border-r border-zinc-300 dark:border-zinc-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Tickets</h2>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="space-y-2 flex flex-col-reverse gap-2 justify-center items-start">
                    {loading ? (
                        <p>Loading...</p>
                    ) : tickets.length ? (
                        tickets.map((ticket) => (
                            <div className='w-full cursor-pointer p-4 rounded-xl border-[0.5px]' key={ticket.id}>
                                <div className='w-full flex justify-evenly items-center p-2'>
                                    <span className='text-lg font-semibold'>{ticket.subject}</span>
                                    <span>{ticket.description}</span>
                                </div>
                                {ticket.status === 'open' && (
                                    <button
                                        id={ticket.id}
                                        onClick={(e) => acceptTicket(e.target.id)}
                                        className="mt-2 p-2 bg-[var(--primary)] text-[var(--bg-color)] rounded"
                                    >
                                        {acceptingId === ticket.id ? 'Accepting...' : 'Accept'}
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No tickets available</p>
                    )}
                </div>
            </div>

            <div className="w-1/2 rounded-xl bg-[var(--bg-color)] dark:bg-zinc-900 p-4 space-y-4 border-r border-zinc-300 dark:border-zinc-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Conversations</h2>
                </div>
                <div className="space-y-2 flex flex-col-reverse gap-2 justify-center items-start">
                    {conversations.map((conversation) => (
                        <div
                            className={`w-full cursor-pointer text-lg font-bold p-4 rounded-xl border-[0.5px] ${conversationId === conversation.id ? 'bg-gray-200 dark:bg-gray-700' : ''
                                }`}
                            onClick={() => selectConversation(conversation.id)}
                            key={conversation.id}
                        >
                            {conversation.customer.username}
                        </div>
                    ))}
                </div>
            </div>
            <div className='w-full rounded-xl bg-[var(--bg-color)] flex flex-col items-center justify-between'>
                {/* Messages Container - Fixed height with scroll */}
                <div className='w-full h-[400px] overflow-y-auto py-4 px-6 flex flex-col-reverse rounded-t-xl'>
                    {conversationId ? (
                        messages.length ? (
                            // We use flex-col-reverse to pin to bottom by default
                            <div className='flex flex-col space-y-2'>
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`w-full px-3 py-2 rounded-xl ${msg.sender.id === wsInfo?.user?.id
                                            ? 'bg-[var(--primary)] text-[var(--bg-color)] ml-auto max-w-[80%]'
                                            : 'bg-gray-200 dark:bg-gray-700 mr-auto max-w-[80%]'
                                            }`}
                                    >
                                        <p>{msg.message}</p>
                                        <p className="text-xs opacity-70 mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className='h-full flex items-center justify-center'>
                                <p>No messages yet</p>
                            </div>
                        )
                    ) : (
                        <div className='h-full flex items-center justify-center'>
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>

                {/* Message Input */}
                {conversationId && (
                    <div className="w-full p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                            <input
                                type='text'
                                className='w-full border rounded-xl px-4'
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                            />
                            <button
                                className='w-fit flex justify-center items-center rounded-xl p-4 bg-[var(--primary)] text-lg text-[var(--bg-color)]'
                                onClick={sendMessage}
                                disabled={!message.trim() || !socket}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
