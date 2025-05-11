"use client"

import { API_URL } from "@/app/utils/constants"
import { BedTwoTone } from "@mui/icons-material"
import { useEffect, useState } from "react"

export default function Notifications() {
    const [notifications, setNotifications] = useState([])
    const [count, setCount] = useState(0)
    
    const fetchNotifications = async () => {

        try {
            const response = await fetch(`${API_URL}/notifications/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            if (response.ok) {
                console.log("fetch of notifications successful")
                const data = await response.json()
                setNotifications(data)
            } else { throw new Error('error fetching notification') }
        } catch (err) {
            alert(err)
        }

    }

    const fetchNotificationsUnreadCount = async () => {

        try {
            const response = await fetch(`${API_URL}/notifications/unread-count/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            if (response.ok) {
                console.log("fetch of unread count successful")
                const data = await response.json()
                setCount(data.unread_count)

            } else {
                throw new Error("error fetching unread notification count")
            }
        } catch (err) {
            alert("Error: " + err)
        }

    }

    


    const markAsRead = async (id) => {
        try {
            const response = await fetch(`${API_URL}/notifications/read/${id}/`, {
                method: "PATCH",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            if (!response.ok) {
                throw new Error("cannot mark notification as read")
            }

            console.log("notification read")

        } catch (err) {
            alert("Error: " + err)
        }

    }

    const markAllAsRead = async () => {
        try {
            await Promise.all(
                notifications.map((el, index) => {
                    console.log("marking notification " + index + " as read")
                    return markAsRead(el.id)
                })
            )
        } catch (err) {
            alert("Error marking all as read: " + err)
        }
    }

    useEffect(() => {
       


        fetchNotifications()

        fetchNotificationsUnreadCount()


    }, [])

    useEffect(() => {
        if (notifications.length > 0) {
            markAllAsRead();
        }
    }, [notifications]);
    
    
    const deleteNotification = async (id) => {
        try {
            const response = await fetch(`${API_URL}/notifications/delete/${id}/`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            if (!response.ok) {

                throw new Error("cannot delete notification as read")
            }
            console.log("notification deleted")

            fetchNotifications()
        } catch (err) {
            alert("Error: " + err)
        }

    }

    return (
        <div className="w-full bg-[var(--bg-color)] overflow-hidden rounded-xl min-h-[40vh] flex flex-col justify-start items-center">
            {
                notifications.length ?
                    (
                        notifications.map((notification, index) => {

                            return (
                                <div key={notification.id} className={`w-full flex flex-col sm:flex-row justify-between items-center p-4 text-lg ${notification.status === 'unread' ? "bg-white  border-b-[0.01px] border-[rgba(0,0,0,0.2)] " :"bg-transparent"}`}>
                                    <div className="w-full flex justify-between items-center gap-2 pr-6">
                                        <div className="w-full">
                                             <h1 className={`  text-[var(--primary)] ${notification.status === 'unread' ? "text-xl font-bold":"text-lg " } `}>{notification.title}</h1>
                                            <p className="text-md">{notification.message}</p>
                                        </div> <p className="text-lg text-[var(--secondary)] text-right">{notification.type}</p>

                                    </div>
                                    <div className="w-fit flex justify-end items-center gap-2">

                                       <button className=" p-2 border border-[var(--primary)] text-[var(--primary)]" onClick={()=>deleteNotification(notification.id)}>Delete</button>

                                    </div>
                                </div>
                            )
                        }))
                    : (
                        <h1 className="w-full text-center p-4 txet-xl font-bold">No notifications</h1>
                    )
            }

        </div>)
}