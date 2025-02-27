import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarHeader from './components/CalendarHeader';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import AdvancedSidebar from './components/AdvancedSidebar';
import AdvancedEventModal from './components/AdvancedEventModal';
import AiSuggestionPanel from './components/AiSuggestionPanel';
import AiAssistant from './components/AiAssistant';
import AnalyticsPanel from './components/AnalyticsPanel';
import { useCalendarStore } from './store/calendarStore';
import { aiService } from './services/aiService';

function App() {
  const { 
    currentDate,
    events,
    view,
    selectedEvent,
    selectedDate,
    isModalOpen,
    isAiPanelOpen,
    setCurrentDate,
    setView,
    addEvent,
    updateEvent,
    deleteEvent,
    selectEvent,
    selectDate,
    toggleModal,
    toggleAiPanel,
    getFilteredEvents
  } = useCalendarStore();
  
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  
  // Initialize AI suggestions when app loads
  useEffect(() => {
    aiService.refreshSuggestions();
  }, []);
  
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewChange = (newView: 'month' | 'week' | 'day' | 'agenda' | 'timeline' | 'year' | 'gantt' | 'focus') => {
    setView(newView);
  };

  const handleDateClick = (date: Date) => {
    selectDate(date);
  };

  const handleEventClick = (event: any) => {
    selectEvent(event);
  };

  const handleAddEvent = () => {
    selectDate(new Date());
  };

  const handleSaveEvent = (event: any) => {
    if (selectedEvent) {
      updateEvent(event);
    } else {
      addEvent(event);
    }
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
  };
  
  const handleToggleAiAssistant = () => {
    setIsAiAssistantOpen(!isAiAssistantOpen);
  };
  
  const handleToggleAnalytics = () => {
    setIsAnalyticsOpen(!isAnalyticsOpen);
  };
  
  const filteredEvents = getFilteredEvents();

  return (
    <div className="flex flex-col h-screen bg-white">
      <CalendarHeader 
        currentDate={currentDate}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        view={view}
        onViewChange={handleViewChange}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <AdvancedSidebar 
          onAddEvent={handleAddEvent}
          onEventClick={handleEventClick}
          onToggleAiAssistant={handleToggleAiAssistant}
          onToggleAnalytics={handleToggleAnalytics}
        />
        
        <main className="flex-1 overflow-auto relative">
          <AnimatePresence mode="wait">
            {view === 'month' && (
              <motion.div
                key="month-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <MonthView 
                  currentDate={currentDate}
                  events={filteredEvents}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                />
              </motion.div>
            )}
            
            {view === 'week' && (
              <motion.div
                key="week-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <WeekView 
                  currentDate={currentDate}
                  events={filteredEvents}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                />
              </motion.div>
            )}
            
            {view === 'day' && (
              <motion.div
                key="day-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <DayView 
                  currentDate={currentDate}
                  events={filteredEvents}
                  onTimeClick={handleDateClick}
                  onEventClick={handleEventClick}
                />
              </motion.div>
            )}
            
            {isAnalyticsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-white z-10 p-6 overflow-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Calendar Analytics</h2>
                  <button
                    onClick={() => setIsAnalyticsOpen(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
                <AnalyticsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {isAiPanelOpen && (
          <AiSuggestionPanel onToggleAiAssistant={handleToggleAiAssistant} />
        )}
      </div>
      
      <AdvancedEventModal 
        isOpen={isModalOpen}
        onClose={() => toggleModal(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent || undefined}
        selectedDate={selectedDate || undefined}
      />
      
      <AiAssistant 
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />
    </div>
  );
}

export default App;