import React from "react";
const handleAddEvent = (e) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date) {
      setEvents([...events, { ...newEvent, backgroundColor: "#007bff", textColor: "#fff" }]);
      setNewEvent({ title: "", date: "" }); // Reset form
      setShowForm(false); // Hide form after adding
    }
  };

const Form = () => {
  return (
    <div className="w-80 rounded-2xl bg-slate-900">
      <form onSubmit={handleAddEvent} className="flex flex-col gap-2 p-8">
        <input
          type="text"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          className="bg-slate-900 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-800"
        />
        <input
          type="date"
          value={newEvent.date}
          className="bg-slate-900 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-800"
        />
        <button
          type="submit"
          className="inline-block cursor-pointer rounded-md bg-gray-700 px-4 py-3.5 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2 active:scale-95"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default Form;
