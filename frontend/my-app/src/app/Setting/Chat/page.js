"use client"

import { useState, useEffect } from 'react';
import { useForm } from '@/app/context/FormContext';
import Pusher from 'pusher-js';

{/**
    import React from 'react';


export default Card;
 */}

export default function Messages() {
    const { formData } = useForm()
    const  username  = formData.username
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")

    useEffect(() => {
        // Enable pusher logging - don't include this in production
        Pusher.logToConsole = true;

        const pusher = new Pusher('4b8aedc65def2e33fdf6', {
            cluster: 'eu'
        });

        const channel = pusher.subscribe('chat');
        channel.bind('message', function (data) {
            setMessages((prevMessages) => [...prevMessages, data]);
        });
    }, [])
      
    const submit = async (e) => {
        e.preventDefault()
        const response = await fetch("http://localhost:3000/api/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username ,  message })
        })

        setMessages([...messages, {username, message }])
        setMessage("")
    }

    


   


    return (
        <div className="w-full rounded-xl  flex flex-row gap-14 px-16">
            <div className=" w-full mx-auto bg-white dark:bg-zinc-800 shadow-md rounded-lg overflow-hidden">
                <div className="flex flex-col min-h-[400px]">
                    <div className="px-4 py-3 border-b dark:border-zinc-700">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">
                                Messages
                            </h2>
                        </div>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto flex flex-col space-y-2" id="chatDisplay">
                        {messages.length > 0 && messages.map((msg, index) => (  
                            <div className="flex flex-col " key={index}>
                                <div className="p-4 w-full">{msg.username}
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{msg.message}</div>
                                </div>
                            </div>
                        ))}
                        {!messages.length ? <div className="flex justify-center items-center h-full">No messages yet</div> : null}
                    </div>
                    <div className="px-3 py-2 border-t dark:border-zinc-700">
                        <div className="flex gap-2">
                            <input placeholder="Type your message..." className="flex-1 p-2 border rounded-lg dark:bg-zinc-700 dark:text-white dark:border-zinc-600 text-sm" id="chatInput" type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
                            <button type='submit' onClick={submit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg transition duration-300 ease-in-out text-sm" id="sendButton">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>



        </div>
    )
}