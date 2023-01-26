import React, { useState, useEffect } from 'react';
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
  const [availabilities, setAvailabilities] = useState([]);

  useEffect(() => {
    fetch(`${serverUrl}/api/v1/availabilities?guideId=${guideId}`)
      .then((response) => response.json())
      .then((data) => setAvailabilities(data));
  }, []);

  const moveToPreviousWeek = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setToday(addDays(today, -7));
  };

  const moveToNextWeek = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setToday(addDays(today, 7));
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
          <li key={+day}>
            {format(day, 'eee')} {day.getDate()}
          </li>
        ))}
      </ul>

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
