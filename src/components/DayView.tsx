import React from 'react';
import { format, addHours, isSameDay } from 'date-fns';
import { CalendarEvent } from '../types';
import EventItem from './EventItem';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const DayView: React.FC<DayViewProps> = ({ 
  currentDate, 
  events, 
  onTimeClick,
  onEventClick
}) => {
  // Hours to display (5 AM to 9 PM)
  const hours = Array.from({ length: 17 }, (_, i) => i + 5);
  
  // Get events for the current day
  const dayEvents = events.filter(event => 
    isSameDay(event.start, currentDate)
  );
  
  // Get events for a specific hour
  const getEventsForHour = (hour: number): CalendarEvent[] => {
    return dayEvents.filter(event => event.start.getHours() === hour);
  };
  
  // Current time indicator
  const now = new Date();
  const isCurrentDay = isSameDay(now, currentDate);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  return (
    <div className="flex flex-col h-full">
      {/* Day header */}
      <div className="p-4 border-b text-center">
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>
      
      {/* All-day events */}
      {dayEvents.filter(event => event.isAllDay).length > 0 && (
        <div className="border-b p-2">
          <div className="text-xs font-medium text-gray-500 mb-1">ALL DAY</div>
          {dayEvents
            .filter(event => event.isAllDay)
            .map(event => (
              <EventItem 
                key={event.id} 
                event={event} 
                onClick={() => onEventClick(event)}
              />
            ))
          }
        </div>
      )}
      
      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative min-h-full">
          {hours.map(hour => {
            const hourEvents = getEventsForHour(hour);
            
            return (
              <div key={hour} className="flex border-b h-16 group">
                {/* Time label */}
                <div className="w-16 flex-shrink-0 p-1 text-right text-xs text-gray-500 border-r">
                  {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                </div>
                
                {/* Hour cell */}
                <div 
                  className="flex-1 relative hover:bg-gray-50"
                  onClick={() => {
                    const clickedDate = new Date(currentDate);
                    clickedDate.setHours(hour, 0, 0, 0);
                    onTimeClick(clickedDate);
                  }}
                >
                  {/* Current time indicator */}
                  {isCurrentDay && currentHour === hour && (
                    <div 
                      className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                      style={{ top: `${(currentMinute / 60) * 100}%` }}
                    >
                      <div className="absolute -left-3 -top-2 w-4 h-4 rounded-full bg-red-500"></div>
                    </div>
                  )}
                  
                  {/* Events */}
                  {hourEvents.map(event => (
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
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;