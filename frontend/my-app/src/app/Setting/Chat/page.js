"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '@/app/utils/constants';
import { getMyProfile } from '@/app/utils/auth';
import { CallReceivedRounded, Description } from '@mui/icons-material';
import InputLogin from '@/app/Dashboard/Components/InputLogin.js'
import { tokens } from '@/app/Dashboard/theme';
import { Cross, Heart } from 'lucide-react';

const FormTicket = ({ setClicked, handleSubmit, setFormTicket, formTicket }) => (
    <form className='w-full px-2 rounded-xl relative bg-[var(--bg-color)] flex flex-col justify-start items-end gap-4 py-4 text-black min-h-64' onSubmit={handleSubmit}>
        <div className='w-full text-lg flex justify-between'>
            <h3>Add a Ticket</h3>
            <Cross size={20} fill='var(--primary)' onClick={() => {
                setClicked(false)
            }} className='rotate-[45deg]' />
        </div>
        <InputLogin type={"text"} name={"subject"} placeholder={'Enter the subject of your ticket...'} onChange={(e) => {
            e.preventDefault();
            setFormTicket(prev => ({ ...prev, subject: e.target.value }))
        }} value={formTicket['subject']}
        />
        <InputLogin type={"text"} name={"subject"} placeholder={'Enter the Description of your ticket...'} onChange={(e) => {
            e.preventDefault();
            setFormTicket(prev => ({ ...prev, description: e.target.value }))
        }} value={formTicket['description']}
        />
        <button type='submit' onClick={handleSubmit} className='w-1/2 text-[var(--bg-color)] rounded-xl p-4 text-lg font-semibold bg-[var(--primary)]'>Submit</button>
    </form>
)

const ConversationBox = ({ conversation, isSelected, onClick }) => {
    return (
        <div
            className={`w-full cursor-pointer text-lg font-bold p-4 rounded-xl border-[0.5px] ${isSelected ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
            onClick={onClick}
        >
            {conversation.admin.username}
        </div>
    );
};

const NoTokenEl = ({ handleSubmit, setFormTicket, formTicket }) => {
    const [clicked, setClicked] = useState(false);

    return (
        <div className='relative w-full flex flex-col justify-center items-center gap-6'>
            {!clicked ?
                <button
                    className='w-1/2 text-[var(--bg-color)] rounded-xl p-4 text-lg font-semibold bg-[var(--primary)]'
                    onClick={() => { setClicked(prev => !prev) }}
                >
                    New Token
                </button> :
                <FormTicket
                    handleSubmit={handleSubmit}
                    setClicked={setClicked}
                    setFormTicket={setFormTicket}
                    formTicket={formTicket}
                />
            }
        </div>
    )
}

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);
    const [conversationId, setConversationId] = useState(() => {
        localStorage.removeItem('lastSelectedCustomerConversationId')
        localStorage.removeItem('conversationId')
        return null;
    });
    const [isInitializing, setIsInitializing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [tickets, setTickets] = useState([]);
    const messagesEndRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [wsInfo, setWsInfo] = useState(null);

    const [formTicket, setFormTicket] = useState({
        subject: '', description: ''
    });

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
            console.log(info)
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
                    
                    if(data.type === "message"){  
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

            newSocket.onerror = (error) => {
                console.log(error)
                setError("WebSocket connection error");
            };

            newSocket.onclose = (event) => {
                if (event.code !== 1000) {
                    console.log(event)
                }
            };

            return newSocket;
        } catch (error) {
            console.error('WebSocket initialization error:', error);
            setError("Failed to initialize WebSocket");
            return null;
        }
    }, [getSocketInfo]);

    useEffect(() => {
        if (socket) {
            console.log('Socket status:', {
                readyState: socket.readyState,
                url: socket.url,
                protocol: socket.protocol
            });

            if (socket.readyState === 1) {
                console.log('WebSocket is properly connected');
            }
        }
    }, [socket]);

    async function fetchTickets() {
        try {
            setLoading(true);
            const responseUser = await getMyProfile();
            setUser(responseUser.profile);

            const response = await fetch(`${API_URL}/chat/support-tickets/`, {
                headers: {
                    'Authorization': `Bearer ${responseUser.token}`
                },
            });

            const data = await response.json();
            setTickets(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const response = await fetch(`${API_URL}/chat/support-tickets/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(formTicket),
        });

        if (!response.ok) {
            setError('Failed to create ticket');
            setLoading(false);
            return;
        }

        const data = await response.json();
        setLoading(false);
        alert('Request Sent');
        setFormTicket({ subject: '', description: '' });
        fetchConversations();
    }

    const fetchConversations = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/chat/direct-conversations/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
            });

            if (response.ok) {
                localStorage.removeItem('conversation_id')
                const data = await response.json();
                setConversations(data);
            } else {
                setError('Failed to fetch conversations');
            }
        } catch (err) {
            setError('Error fetching conversations: ' + err.message);
        }
    }, []);

    const fetchConversationMessages = useCallback(async (id) => {
        if (!id) return;

        try {
            const cachedMessages = localStorage.getItem(`chatMessages-${id}`);
            if (cachedMessages) {
                const parsedMessages = JSON.parse(cachedMessages);
                setMessages(parsedMessages);
            } else {
                setMessages([]);
            }

            const response = await fetch(`${API_URL}/chat/direct-conversations/${id}/messages/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setMessages(prev=>{
                        const currentIds = prev.map(msg=>msg.id)
                        const newMessgs = data.filter(msg=>!currentIds.includes(msg.id))
                        return [...prev , ...newMessgs]
                    });
                    localStorage.setItem(`chatMessages-${id}`, JSON.stringify(data));
                }
            } else {
                console.error('Failed to fetch messages:', response.status);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }, []);

    const selectConversation = useCallback((id) => {
        setConversationId(id);
        localStorage.setItem('lastSelectedCustomerConversationId', id);
    }, []);

    const sendMessage = useCallback(async () => {
        if (!message.trim() || !conversationId || !socket) return;

        const tempId = Date.now();
        const tempMessage = {
            id: tempId,
            message: message,
            sender: { username: "you" , id:wsInfo?.user?.id },
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const initialize = async () => {
            await fetchConversations();
            setIsInitializing(false);
        };
        initialize();
    }, [fetchConversations]);

    useEffect(() => {
        let currentSocket = null;

        const setupWebSocket = async () => {
            if (conversationId) {
                await fetchConversationMessages(conversationId);
                currentSocket = await initWebSocket(conversationId);
            }
        };

        setupWebSocket();

        return () => {
            if (currentSocket) {
                currentSocket.close();
            }
        };
    }, [conversationId, fetchConversationMessages, initWebSocket]);

    if (isInitializing) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="w-full min-h-[40vh] rounded-xl  flex lg:flex-row flex-col gap-6">
            {/* Sidebar */}
            <div className="lg:w-1/2 md:w-1/2 w-full rounded-xl bg-[var(--bg-color)] dark:bg-zinc-900 p-4 space-y-4 border-r border-zinc-300 dark:border-zinc-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Conversations</h2>
                </div>
                <div className="space-y-2 flex flex-col-reverse gap-2 justify-center items-start">
                    <NoTokenEl
                        formTicket={formTicket}
                        setFormTicket={setFormTicket}
                        handleSubmit={handleSubmit}
                    />

                    {conversations.map((conversation) => (
                        <ConversationBox
                            key={conversation.id}
                            conversation={conversation}
                            isSelected={conversationId === conversation.id}
                            onClick={() => selectConversation(conversation.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className='w-full rounded-xl bg-[var(--bg-color)] flex flex-col items-center justify-between'>
                <div className='w-full h-[400px] overflow-y-auto py-4 px-6 flex flex-col-reverse rounded-t-xl'>
                    {conversationId ? (
                        messages.length ? (
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