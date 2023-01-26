import React from 'react';
import './App.css';
import WeeklyCalandar from './WeeklyCalandar';

const guideId = process.env.REACT_APP_GUIDE_ID;

function App() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="md:grid md:grid-cols-4 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-1 text-medium text-gray-600">User ID: {guideId}</p>
          </div>
        </div>
        <div className="md:col-span-3 md:mt-0">
          <h1 className="text-3xl font-bold text-gray-900">Weekly Planner</h1>
          <WeeklyCalandar />
        </div>
      </div>
    </div>
  );
}

export default App;
