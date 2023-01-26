import React, { useState, useEffect, useRef } from 'react';
import { addDays, startOfWeek, format, compareDesc } from 'date-fns';

interface Availability {
  id: number;
  startAt: string;
  endAt: string;
  added?: boolean;
}

const serverUrl = process.env.REACT_APP_SERVER_URL;

// TODO: Remove this later. This is only for development
const guideId = process.env.REACT_APP_GUIDE_ID;

function calculateDays(today: Date, selectedDate?: Date) {
  const start = startOfWeek(today);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(start, i);
    const selected = selectedDate?.getDate() === day.getDate();
    days.push({ day, selected });
  }
  return days;
}

function WeeklyCalandar() {
  const [today, setToday] = useState(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [timeSelectionError, setTimeSelectionError] = useState<string>();
  const [getApiError, setGetApiError] = useState<string>();
  const [postApiError, setPostApiError] = useState<string>();
  const formRef = useRef<HTMLFormElement>(null);
  const startAt = useRef<HTMLInputElement>(null);
  const endAt = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${serverUrl}/api/v1/availabilities?guideId=${guideId}`)
      .then((response) => response.json())
      .then((data) => setAvailabilities(data))
      .catch((err) => {
        console.error(err.message);
        setGetApiError('Failed to retrieve availabilities. Please try again later.');
      });
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

  const pickDate = (day: Date) => {
    setTimeSelectionError(undefined);
    formRef.current?.reset();
    setSelectedDate(day);
  };

  const addAvailability = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate) {
      return;
    }

    if (!startAt.current?.value || !endAt.current?.value) {
      setTimeSelectionError('Please pick both start and end times');
      return;
    }

    setTimeSelectionError(undefined);
    setPostApiError(undefined);

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const date = selectedDate.getDate();
    const [startHour, startMinute] = startAt.current.value.split(':');
    const [endHour, endMinute] = endAt.current.value.split(':');
    const startAtDate = new Date(year, month, date, +startHour, +startMinute);
    const endAtDate = new Date(year, month, date, +endHour, +endMinute);

    if (compareDesc(startAtDate, endAtDate) !== 1) {
      setTimeSelectionError('Please pick an end time greater than the start time');
      return;
    }

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
      .then((newAvailability: Availability) => {
        formRef.current!.reset();
        setSelectedDate(undefined);
        setAvailabilities([
          ...availabilities.map((avl) => ({ ...avl, added: false })),
          { ...newAvailability, added: true },
        ]);
      })
      .catch((err) => {
        console.error(err.message);
        setPostApiError('Failed to create an availability. Please try again later.');
      });
  };

  return (
    <div className="weekly-calendar">
      <p className="mt-2 text-medium text-gray-600">
        Week {format(today, 'I')} in {today.getFullYear()}
      </p>

      <div className="mt-5 mb-5 flex flex-row justify-between">
        <button
          onClick={moveToPreviousWeek}
          className="rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          PREV
        </button>
        <button
          onClick={moveToNextWeek}
          className="rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          NEXT
        </button>
      </div>

      <ul className="flex flex-row justify-between">
        {calculateDays(today, selectedDate).map(({ day, selected }) => (
          <li
            className={`day-element rounded-md border border-gray-300 py-4 px-5 text-medium font-light leading-4 text-gray-700 shadow-sm hover:bg-gray-50 ${
              selected ? 'bg-slate-200' : ''
            }`}
            key={+day}
            onClick={() => pickDate(day)}
          >
            <span className="mb-3 text-sm font-bold">{format(day, 'MMM')}</span>
            <br />
            {format(day, 'eee')} {format(day, 'do')}
          </li>
        ))}
      </ul>

      {selectedDate ? (
        <div className="mt-5 border p-3 bg-slate-200">
          <h3 className="font-bold">Add Availability</h3>
          <p className="mt-1 mb-1 text-medium text-gray-600">{format(selectedDate, 'eeee MMM do')}</p>
          <form ref={formRef} onSubmit={addAvailability} className="availability-form">
            <span className="mr-5">
              Start:{' '}
              <input
                type="time"
                min="07:00"
                max="21:45"
                ref={startAt}
                className="ml-2 rounded-md border border-gray-300"
              />
            </span>
            <span className="mr-5">
              End:{' '}
              <input
                type="time"
                min="07:15"
                max="22:00"
                ref={endAt}
                className="ml-2 rounded-md border border-gray-300"
              />
            </span>
            <button
              type="submit"
              className="mt-2 rounded-md border border-gray-300 bg-white py-3 px-4 text-medium font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              ADD
            </button>
            {timeSelectionError ? <p className="mt-2 text-red-400 font-bold">{timeSelectionError}</p> : null}
            {postApiError ? <p className="mt-2 text-red-400 font-bold">{postApiError}</p> : null}
          </form>
        </div>
      ) : null}

      <h3 className="mt-5 font-bold">Availabilities</h3>
      {getApiError ? <p className="mt-2 text-red-400 font-bold">{getApiError}</p> : null}
      <ul className="mt-2">
        {availabilities
          .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))
          .map((availability: Availability, i) => (
            <li key={i} className={`availability mb-1 font-mono ${availability.added ? 'added' : ''}`}>
              {format(new Date(availability.startAt), 'MMM dd ccc hh:mma')} -{' '}
              {format(new Date(availability.endAt), 'hh:mma')}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default WeeklyCalandar;
