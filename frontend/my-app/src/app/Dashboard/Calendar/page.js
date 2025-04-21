"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "" });


  useEffect(() => {
    // Fetch events from the server
    const fetchEvents = async () => {
      try {
        const response = await localStorage.getItem("events");
        const data = JSON.parse(response);
        if (!data) {
          console.log("No events found in local storage.");
          return;
        }
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);
  // Open form and set clicked date
  const handleDateClick = (arg) => {
    setNewEvent({ title: "", date: arg.dateStr });
    setShowForm(true);
  };

  // Add event and close form
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (newEvent.title.trim()) {
      setEvents([
        ...events,
        { title: newEvent.title, date: newEvent.date, id: Date.now() }
      ]);

      const existingEvents = JSON.parse(localStorage.getItem("events")) || [];
      localStorage.setItem("events", JSON.stringify([...existingEvents, { title: newEvent.title, date: newEvent.date, id: Date.now() }]));
      setShowForm(false);
      setNewEvent({ title: "", date: "" }); // Reset form
    }
  };

  // Delete event when clicked
  const handleEventClick = (clickInfo) => {
    if (confirm(`Delete event ${clickInfo.event.title} ?`)) {
      setEvents(events.filter(event => event.id !== parseInt(clickInfo.event.id)));
      const existingEvents = JSON.parse(localStorage.getItem("events")) || [];
      const updatedEvents = existingEvents.filter(event => event.id !== parseInt(clickInfo.event.id));
      localStorage.setItem("events", JSON.stringify(updatedEvents));
      clickInfo.event.remove();
    }
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        events={events}
        eventClick={handleEventClick}
      />

      {showForm && (
        <EventForm
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          handleAddEvent={handleAddEvent}
          handleCloseForm={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function EventForm({ newEvent, setNewEvent, handleAddEvent, handleCloseForm }) {
  return (
    <div className="z-10 absolute top-1/2 left-1/2">
      <div className="w-80 rounded-2xl bg-slate-900 p-6 relative">
        <button className="absolute top-2 right-4 text-white text-xl" onClick={handleCloseForm}>✖</button>
        <h3 className="text-white text-center mb-4">Add Event</h3>
        <form onSubmit={handleAddEvent} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
            className="bg-gray-700 text-white w-full rounded-lg border border-gray-600 px-4 py-3"
          />
          <input
            type="date"
            value={newEvent.date}
            readOnly
            className="bg-gray-700 text-white w-full rounded-lg border border-gray-600 px-4 py-3"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition">
            Add Event
          </button>
        </form>
      </div>
    </div>
  );
}