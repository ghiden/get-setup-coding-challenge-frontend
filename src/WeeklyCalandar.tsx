import React, { useState, useEffect, useRef } from 'react';
import { addDays, getWeek, getYear, startOfWeek, format } from 'date-fns';

interface Availability {
  id: number;
  startAt: string;
  endAt: string;
}

const serverUrl = process.env.REACT_APP_SERVER_URL;

// TODO: Remove this later. This is only for development
const guideId = process.env.REACT_APP_GUIDE_ID;
console.log(`Initializing with Guide ID ${guideId}`);

function calculateDays(today: Date) {
  const start = startOfWeek(today);
  const days = [start];
  for (let i = 1; i <= 6; i++) {
    days.push(addDays(start, i));
  }
  return days;
}

function calculateWeekIndex(today: Date) {
  return getWeek(today);
}

function calculateYear(today: Date) {
  return getYear(today);
}

function WeeklyCalandar() {
  const [today, setToday] = useState(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const startAt = useRef<HTMLInputElement>(null);
  const endAt = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${serverUrl}/api/v1/availabilities?guideId=${guideId}`)
      .then((response) => response.json())
      .then((data) => setAvailabilities(data));
  }, []);

  const moveToPreviousWeek = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSelectedDate(undefined);
    setToday(addDays(today, -7));
  };

  const moveToNextWeek = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSelectedDate(undefined);
    setToday(addDays(today, 7));
  };

  const addAvailability = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!(selectedDate && startAt.current?.value && endAt.current?.value)) {
      return;
    }

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const date = selectedDate.getDate();
    const [startHour, startMinute] = startAt.current.value.split(':');
    const [endHour, endMinute] = endAt.current.value.split(':');
    const startAtDate = new Date(year, month, date, +startHour, +startMinute);
    const endAtDate = new Date(year, month, date, +endHour, +endMinute);

    const params = {
      guideId,
      availability: {
        startAt: startAtDate.toISOString(),
        endAt: endAtDate.toISOString(),
      },
    };
    fetch(`${serverUrl}/api/v1/availabilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
      .then((response) => response.json())
      .then((newAvailability: Availability) => setAvailabilities([...availabilities, newAvailability]));
  };

  return (
    <div className="weekly-calendar mt-5">
      <h1>
        {calculateYear(today)} Week: {calculateWeekIndex(today)}
      </h1>

      <div className="mt-5 flex flex-row justify-between">
        <button onClick={moveToPreviousWeek}>prev</button>
        <button onClick={moveToNextWeek}>next</button>
      </div>

      <ul className="flex flex-row justify-between">
        {calculateDays(today).map((day) => (
          <li className="day-element" key={+day} onClick={() => setSelectedDate(day)}>
            {format(day, 'eee')} {day.getDate()}
          </li>
        ))}
      </ul>

      {selectedDate ? (
        <div className="mt-5">
          <h3 className="font-bold">Add Availability</h3>
          <p>{format(selectedDate, 'eeee d')}</p>
          <form onSubmit={addAvailability} className="availability-form">
            Start: <input type="time" ref={startAt} />
            End: <input type="time" ref={endAt} />
            <br />
            <button type="submit">Add</button>
          </form>
        </div>
      ) : null}

      <h3 className="mt-5 font-bold">Availabilities</h3>
      <ul>
        {availabilities.map((availability: Availability, i) => (
          <li key={i}>
            {availability.id}: {availability.startAt} - {availability.endAt}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WeeklyCalandar;
