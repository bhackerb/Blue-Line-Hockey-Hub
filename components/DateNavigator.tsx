
import React from 'react';

interface DateNavigatorProps {
  date: Date;
  setDate: (date: Date) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ date, setDate }) => {
  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    setDate(newDate);
  };

  const isToday = () => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const formatDate = (d: Date): string => {
    if (isToday()) return "Today's Games";
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d);
  };

  return (
    <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl mb-6 shadow-lg ring-1 ring-gray-700/50">
      <button 
        onClick={() => changeDate(-1)} 
        className="p-2.5 bg-gray-700/50 rounded-md hover:bg-gray-700 border border-transparent hover:border-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Previous day"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      <div className="text-center">
        <h2 className="text-xl font-bold">{formatDate(date)}</h2>
        {!isToday() && (
            <button onClick={() => setDate(new Date())} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Jump to Today
            </button>
        )}
      </div>
      <button 
        onClick={() => changeDate(1)} 
        className="p-2.5 bg-gray-700/50 rounded-md hover:bg-gray-700 border border-transparent hover:border-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Next day"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default DateNavigator;