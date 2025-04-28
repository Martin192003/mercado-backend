import React, { useState } from 'react';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function WeeklyCalendar() {
  const [events, setEvents] = useState([]);
  const [eventInput, setEventInput] = useState({ day: '', time: '', description: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventInput({ ...eventInput, [name]: value });
  };

  const handleAddEvent = () => {
    if (eventInput.day && eventInput.time && eventInput.description) {
      setEvents([...events, eventInput]);
      setEventInput({ day: '', time: '', description: '' }); // Reset input fields
    }
  };

  return (
    <div className="weekly-calendar">
      <h2>Weekly Calendar</h2>
      <div className="calendar-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-column">
            <h3>{day}</h3>
            <ul>
              {events
                .filter(event => event.day === day)
                .map((event, index) => (
                  <li key={index}>
                    {event.time}: {event.description}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="event-form">
        <input
          type="text"
          name="day"
          placeholder="Day"
          value={eventInput.day}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="time"
          placeholder="Time"
          value={eventInput.time}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Event Description"
          value={eventInput.description}
          onChange={handleInputChange}
        />
        <button onClick={handleAddEvent}>Add Event</button>
      </div>
    </div>
  );
}

export default WeeklyCalendar;