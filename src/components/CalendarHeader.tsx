import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { ViewType } from '../types';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevious,
  onNext,
  onToday,
  view,
  onViewChange
}) => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <CalendarIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h1 className="text-xl font-bold">Calendar</h1>
        </div>
        <button 
          onClick={onToday}
          className="px-4 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
        >
          Today
        </button>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onPrevious}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={onNext}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <h2 className="text-xl font-semibold">
          {formatDate(currentDate, 'MMMM yyyy')}
        </h2>
      </div>
      <div className="flex space-x-1 border rounded-md overflow-hidden">
        <button 
          className={`px-3 py-1 ${view === 'month' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          onClick={() => onViewChange('month')}
        >
          Month
        </button>
        <button 
          className={`px-3 py-1 ${view === 'week' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          onClick={() => onViewChange('week')}
        >
          Week
        </button>
        <button 
          className={`px-3 py-1 ${view === 'day' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          onClick={() => onViewChange('day')}
        >
          Day
        </button>
      </div>
    </header>
  );
};

export default CalendarHeader;