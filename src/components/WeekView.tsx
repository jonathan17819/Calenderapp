import React from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { CalendarEvent } from '../types';
import EventItem from './EventItem';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ 
  currentDate, 
  events, 
  onDateClick,
  onEventClick
}) => {
  // Get the start and end of the week
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  
  // Get all days in the week
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Hours to display (5 AM to 9 PM)
  const hours = Array.from({ length: 17 }, (_, i) => i + 5);
  
  // Get events for a specific day and hour
  const getEventsForHour = (day: Date, hour: number): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, day) && eventDate.getHours() === hour;
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="flex border-b">
        <div className="w-16 flex-shrink-0"></div>
        {days.map((day, i) => (
          <div 
            key={i} 
            className={`flex-1 p-2 text-center ${isToday(day) ? 'bg-blue-50' : ''}`}
          >
            <div className="text-sm font-medium">{format(day, 'EEE')}</div>
            <div 
              className={`
                inline-flex h-8 w-8 items-center justify-center rounded-full text-sm
                ${isToday(day) ? 'bg-blue-500 text-white' : ''}
              `}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative min-h-full">
          {hours.map(hour => (
            <div key={hour} className="flex border-b h-16">
              {/* Time label */}
              <div className="w-16 flex-shrink-0 p-1 text-right text-xs text-gray-500 border-r">
                {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
              </div>
              
              {/* Day columns */}
              {days.map((day, dayIndex) => {
                const dayEvents = getEventsForHour(day, hour);
                
                return (
                  <div 
                    key={dayIndex} 
                    className="flex-1 border-r relative"
                    onClick={() => {
                      const clickedDate = new Date(day);
                      clickedDate.setHours(hour, 0, 0, 0);
                      onDateClick(clickedDate);
                    }}
                  >
                    {dayEvents.map(event => (
                      <div 
                        key={event.id}
                        className="absolute inset-x-0 mx-1 z-10"
                        style={{
                          top: `${(event.start.getMinutes() / 60) * 100}%`,
                          height: `${Math.max(
                            ((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)) * 100,
                            10
                          )}%`
                        }}
                      >
                        <EventItem 
                          event={event} 
                          onClick={() => onEventClick(event)}
                          isCompact
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;