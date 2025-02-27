import React, { useState } from 'react';
import { Plus, Calendar, Search, ChevronDown, ChevronRight, Settings, BarChart2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent, Calendar as CalendarType } from '../types';
import EventItem from './EventItem';
import { useCalendarStore } from '../store/calendarStore';
import { format, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns';

interface AdvancedSidebarProps {
  onAddEvent: () => void;
  onEventClick: (event: CalendarEvent) => void;
  onToggleAiAssistant: () => void;
  onToggleAnalytics: () => void;
}

const AdvancedSidebar: React.FC<AdvancedSidebarProps> = ({ 
  onAddEvent, 
  onEventClick,
  onToggleAiAssistant,
  onToggleAnalytics
}) => {
  const [searchText, setSearchText] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    upcoming: true,
    calendars: true
  });
  
  const { events, calendars, updateCalendar, updateFilter } = useCalendarStore();
  
  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Filter events based on search text
  const filteredEvents = searchText
    ? events.filter(event => 
        event.title.toLowerCase().includes(searchText.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchText.toLowerCase())
      )
    : events;
  
  // Get today's events
  const todayEvents = filteredEvents.filter(event => isToday(event.start));
  
  // Get tomorrow's events
  const tomorrowEvents = filteredEvents.filter(event => isTomorrow(event.start));
  
  // Get upcoming events (next 7 days excluding today and tomorrow)
  const upcomingEvents = filteredEvents.filter(event => 
    isThisWeek(event.start) && 
    !isToday(event.start) && 
    !isTomorrow(event.start)
  );
  
  // Toggle calendar visibility
  const toggleCalendarVisibility = (calendar: CalendarType) => {
    updateCalendar({
      ...calendar,
      isVisible: !calendar.isVisible
    });
    
    // Update filter to reflect calendar visibility
    updateFilter({
      calendars: calendars
        .filter(c => c.isVisible)
        .map(c => c.id)
    });
  };
  
  return (
    <div className="w-72 border-r bg-white flex flex-col h-full">
      <div className="p-4">
        <button 
          onClick={onAddEvent}
          className="flex items-center justify-center w-full py-2 px-4 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Create Event</span>
        </button>
      </div>
      
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search events"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* AI Assistant Button */}
        <div className="px-4 mb-4">
          <button
            onClick={onToggleAiAssistant}
            className="flex items-center justify-between w-full py-2 px-4 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Ask AI Assistant</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* Analytics Button */}
        <div className="px-4 mb-4">
          <button
            onClick={onToggleAnalytics}
            className="flex items-center justify-between w-full py-2 px-4 rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2" />
              <span>View Analytics</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* Today's Events */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('today')}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>TODAY</span>
            {expandedSections.today ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedSections.today && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 space-y-1 py-2">
                  {todayEvents.length > 0 ? (
                    todayEvents.map(event => (
                      <EventItem 
                        key={event.id} 
                        event={event} 
                        onClick={() => onEventClick(event)} 
                      />
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 py-2">No events today</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Tomorrow's Events */}
        {tomorrowEvents.length > 0 && (
          <div className="mb-4">
            <div className="px-4 py-2 text-sm font-medium text-gray-700">
              TOMORROW
            </div>
            <div className="px-4 space-y-1">
              {tomorrowEvents.map(event => (
                <EventItem 
                  key={event.id} 
                  event={event} 
                  onClick={() => onEventClick(event)} 
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => toggleSection('upcoming')}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span>UPCOMING</span>
              {expandedSections.upcoming ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSections.upcoming && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 space-y-1 py-2">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="mb-2">
                        <div className="text-xs text-gray-500 mb-1">
                          {format(event.start, 'EEEE, MMM d')}
                        </div>
                        <EventItem 
                          event={event} 
                          onClick={() => onEventClick(event)} 
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {/* Search Results */}
        {searchText && (
          <div className="mb-4">
            <div className="px-4 py-2 text-sm font-medium text-gray-700">
              SEARCH RESULTS
            </div>
            <div className="px-4 space-y-1">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <EventItem 
                    key={event.id} 
                    event={event} 
                    onClick={() => onEventClick(event)} 
                  />
                ))
              ) : (
                <div className="text-sm text-gray-500 py-2">No matching events found</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Calendars */}
      <div className="p-4 border-t">
        <button
          onClick={() => toggleSection('calendars')}
          className="flex items-center justify-between w-full mb-2 text-sm font-medium text-gray-700"
        >
          <span>My Calendars</span>
          {expandedSections.calendars ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        <AnimatePresence>
          {expandedSections.calendars && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2">
                {calendars.map(calendar => (
                  <div key={calendar.id} className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded" 
                      style={{ accentColor: calendar.color }}
                      checked={calendar.isVisible}
                      onChange={() => toggleCalendarVisibility(calendar)}
                    />
                    <span className="ml-2 text-sm">{calendar.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Settings */}
      <div className="p-4 border-t">
        <button className="flex items-center text-sm text-gray-600 hover:text-gray-800">
          <Settings className="h-4 w-4 mr-2" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default AdvancedSidebar;