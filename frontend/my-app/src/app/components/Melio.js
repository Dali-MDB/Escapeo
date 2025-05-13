'use client'
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import Image from "next/image"

const Melio = () => {
    const { setMelio } = useAuth()
    
    return (
        <div 
            onClick={() => setMelio(prev => !prev)}
            className="fixed bottom-5 right-10 w-16 h-16 flex justify-center items-center rounded-full overflow-hidden cursor-pointer z-50 hover:scale-110 transition-transform border p-1 duration-200"
        >
            <Image
                src="/melio.png"
                width={64}
                height={64}
                alt="Melio assistant"
                className="w-full h-full object-cover"
            />
        </div>
    )
}

export default Melio