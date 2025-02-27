import React from 'react';
import { CalendarEvent } from '../types';
import { formatEventTime } from '../utils/dateUtils';

interface EventItemProps {
  event: CalendarEvent;
  onClick: () => void;
  isCompact?: boolean;
}

const EventItem: React.FC<EventItemProps> = ({ event, onClick, isCompact = false }) => {
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`
        rounded px-2 py-1 mb-1 cursor-pointer truncate
        ${isCompact ? 'text-xs' : 'text-sm'}
      `}
      style={{ backgroundColor: `${event.color}20`, borderLeft: `3px solid ${event.color}` }}
    >
      {isCompact ? (
        <div className="truncate">{event.title}</div>
      ) : (
        <>
          <div className="font-medium">{event.title}</div>
          <div className="text-xs text-gray-600">
            {formatEventTime(event.start)} - {formatEventTime(event.end)}
          </div>
          {event.description && (
            <div className="text-xs text-gray-600 mt-1 truncate">{event.description}</div>
          )}
        </>
      )}
    </div>
  );
};

export default EventItem;