import React from 'react';
import { 
  getCalendarDays, 
  formatDate, 
  isCurrentMonth, 
  isToday 
} from '../utils/dateUtils';
import { CalendarEvent } from '../types';
import EventItem from './EventItem';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ 
  currentDate, 
  events, 
  onDateClick,
  onEventClick
}) => {
  const days = getCalendarDays(currentDate);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => 
      formatDate(event.start, 'yyyy-MM-dd') === formatDate(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="flex-1 grid grid-cols-7 grid-rows-[auto_repeat(6,_1fr)] h-full">
      {/* Weekday headers */}
      {weekdays.map(day => (
        <div key={day} className="p-2 text-center font-medium text-gray-500 border-b">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {days.map((day, i) => {
        const dayEvents = getEventsForDate(day);
        const isCurrentMonthDay = isCurrentMonth(day, currentDate);
        const isTodayDay = isToday(day);

        return (
          <div 
            key={i} 
            onClick={() => onDateClick(day)}
            className={`
              border-b border-r p-1 min-h-[100px] cursor-pointer
              ${!isCurrentMonthDay ? 'bg-gray-50' : ''}
              ${isTodayDay ? 'bg-blue-50' : ''}
            `}
          >
            <div className="flex justify-between">
              <span 
                className={`
                  inline-flex h-6 w-6 items-center justify-center rounded-full text-sm
                  ${isTodayDay ? 'bg-blue-500 text-white' : ''}
                  ${!isCurrentMonthDay ? 'text-gray-400' : ''}
                `}
              >
                {formatDate(day, 'd')}
              </span>
            </div>
            <div className="mt-1 max-h-[80px] overflow-y-auto">
              {dayEvents.slice(0, 3).map(event => (
                <EventItem 
                  key={event.id} 
                  event={event} 
                  onClick={() => onEventClick(event)}
                  isCompact
                />
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500 mt-1">
                  + {dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthView;