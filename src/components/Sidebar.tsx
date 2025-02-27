import React from 'react';
import { Plus, Calendar, Search } from 'lucide-react';
import { CalendarEvent } from '../types';
import EventItem from './EventItem';

interface SidebarProps {
  events: CalendarEvent[];
  onAddEvent: () => void;
  onEventClick: (event: CalendarEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ events, onAddEvent, onEventClick }) => {
  // Get today's events
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  const todayEvents = events.filter(event => 
    event.start.toISOString().split('T')[0] === todayString
  );

  // Get upcoming events (next 7 days excluding today)
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingEvents = events.filter(event => {
    const eventDate = event.start.toISOString().split('T')[0];
    return eventDate > todayString && eventDate <= nextWeek.toISOString().split('T')[0];
  });

  return (
    <div className="w-64 border-r bg-white flex flex-col h-full">
      <div className="p-4">
        <button 
          onClick={onAddEvent}
          className="flex items-center justify-center w-full py-2 px-4 rounded-full bg-white border border-gray-300 hover:bg-gray-50 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Create</span>
        </button>
      </div>
      
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {todayEvents.length > 0 && (
          <div className="mb-4">
            <h3 className="px-4 py-2 text-sm font-medium text-gray-500">TODAY</h3>
            <div className="px-4 space-y-1">
              {todayEvents.map(event => (
                <EventItem 
                  key={event.id} 
                  event={event} 
                  onClick={() => onEventClick(event)} 
                />
              ))}
            </div>
          </div>
        )}
        
        {upcomingEvents.length > 0 && (
          <div className="mb-4">
            <h3 className="px-4 py-2 text-sm font-medium text-gray-500">UPCOMING</h3>
            <div className="px-4 space-y-1">
              {upcomingEvents.map(event => (
                <EventItem 
                  key={event.id} 
                  event={event} 
                  onClick={() => onEventClick(event)} 
                />
              ))}
            </div>
          </div>
        )}
        
        {todayEvents.length === 0 && upcomingEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <Calendar className="h-8 w-8 mb-2" />
            <p className="text-sm">No upcoming events</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center text-sm text-gray-600">
          <span>My Calendars</span>
        </div>
        <div className="mt-2">
          <div className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-blue-500" checked readOnly />
            <span className="ml-2 text-sm">Default Calendar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;