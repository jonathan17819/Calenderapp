import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  CalendarEvent, 
  ViewType, 
  Calendar, 
  User, 
  AiSuggestion, 
  EventFilter,
  AiAssistantMessage
} from '../types';
import { addDays, startOfDay, endOfDay, addMonths } from 'date-fns';

// Sample initial events
const initialEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
    color: '#4285F4',
    description: 'Weekly team sync to discuss project progress',
    location: 'Conference Room A',
    priority: 'medium',
    category: 'work',
    tags: ['meeting', 'team'],
    attendees: [
      { id: '1', name: 'John Doe', email: 'john@example.com', status: 'accepted', isOrganizer: true },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'accepted' }
    ],
    notifications: [
      { id: '1', time: 15, type: 'push' }
    ]
  },
  {
    id: '2',
    title: 'Lunch with Client',
    start: new Date(new Date().setHours(13, 0, 0, 0)),
    end: new Date(new Date().setHours(14, 0, 0, 0)),
    color: '#EA4335',
    description: 'Discuss new project requirements',
    location: 'Bistro on Main',
    priority: 'high',
    category: 'work',
    tags: ['client', 'lunch', 'meeting'],
    attendees: [
      { id: '1', name: 'John Doe', email: 'john@example.com', status: 'accepted', isOrganizer: true },
      { id: '3', name: 'Client Name', email: 'client@example.com', status: 'accepted' }
    ],
    notifications: [
      { id: '2', time: 30, type: 'push' }
    ]
  },
  {
    id: '3',
    title: 'Product Demo',
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    color: '#34A853',
    description: 'Show new features to the marketing team',
    location: 'Demo Room',
    isAllDay: true,
    priority: 'high',
    category: 'work',
    tags: ['demo', 'marketing', 'product'],
    attendees: [
      { id: '1', name: 'John Doe', email: 'john@example.com', status: 'accepted', isOrganizer: true },
      { id: '4', name: 'Marketing Team', email: 'marketing@example.com', status: 'accepted' }
    ]
  },
  {
    id: '4',
    title: 'Quarterly Review',
    start: new Date(new Date().setDate(new Date().getDate() + 3)),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
    color: '#FBBC05',
    description: 'Q2 performance review with management',
    location: 'Board Room',
    isAllDay: true,
    priority: 'medium',
    category: 'work',
    tags: ['review', 'quarterly', 'management'],
    attendees: [
      { id: '1', name: 'John Doe', email: 'john@example.com', status: 'accepted' },
      { id: '5', name: 'Manager', email: 'manager@example.com', status: 'accepted', isOrganizer: true }
    ]
  },
  {
    id: '5',
    title: 'Gym Session',
    start: new Date(new Date().setDate(new Date().getDate() + 1).setHours(18, 0, 0, 0)),
    end: new Date(new Date().setDate(new Date().getDate() + 1).setHours(19, 30, 0, 0)),
    color: '#8E24AA',
    description: 'Weekly fitness routine',
    location: 'Fitness Center',
    priority: 'medium',
    category: 'personal',
    tags: ['health', 'fitness'],
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1, 3, 5] // Monday, Wednesday, Friday
    }
  },
  {
    id: '6',
    title: 'Doctor Appointment',
    start: new Date(new Date().setDate(new Date().getDate() + 5).setHours(14, 0, 0, 0)),
    end: new Date(new Date().setDate(new Date().getDate() + 5).setHours(15, 0, 0, 0)),
    color: '#039BE5',
    description: 'Annual checkup',
    location: 'Medical Center',
    priority: 'high',
    category: 'personal',
    tags: ['health', 'appointment'],
    notifications: [
      { id: '3', time: 60, type: 'push' },
      { id: '4', time: 1440, type: 'email' } // 1 day before
    ]
  }
];

// Sample calendars
const initialCalendars: Calendar[] = [
  { id: '1', name: 'Personal', color: '#4285F4', isVisible: true, isDefault: true, type: 'personal' },
  { id: '2', name: 'Work', color: '#EA4335', isVisible: true, type: 'work' },
  { id: '3', name: 'Family', color: '#34A853', isVisible: true, type: 'personal' },
  { id: '4', name: 'Holidays', color: '#FBBC05', isVisible: true, type: 'holiday' }
];

// Sample user
const initialUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://i.pravatar.cc/150?u=john',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  preferences: {
    defaultView: 'month',
    defaultCalendar: '1',
    workingHours: {
      start: '09:00',
      end: '17:00',
      workDays: [1, 2, 3, 4, 5] // Monday to Friday
    },
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    theme: 'light',
    firstDayOfWeek: 0, // Sunday
    showWeekends: true,
    showDeclinedEvents: false,
    showCompleted: true,
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
    autoDetectLocation: true
  }
};

// Sample AI suggestions
const initialAiSuggestions: AiSuggestion[] = [
  {
    id: '1',
    type: 'optimization',
    message: 'You have 3 meetings scheduled back-to-back. Would you like to add 15-minute breaks between them?',
    confidence: 0.85,
    createdAt: new Date(),
    relatedEventIds: ['1', '2']
  },
  {
    id: '2',
    type: 'new-event',
    message: 'Based on your routine, would you like to schedule a focus time block tomorrow morning?',
    confidence: 0.75,
    createdAt: new Date(),
    suggestedEvent: {
      title: 'Focus Time',
      start: new Date(new Date().setDate(new Date().getDate() + 1).setHours(9, 0, 0, 0)),
      end: new Date(new Date().setDate(new Date().getDate() + 1).setHours(11, 0, 0, 0)),
      color: '#8E24AA',
      category: 'work',
      tags: ['focus', 'productivity']
    }
  }
];

// Initial AI assistant messages
const initialAiMessages: AiAssistantMessage[] = [
  {
    id: '1',
    role: 'system',
    content: 'I am your AI calendar assistant. I can help you manage your schedule, suggest optimizations, and create events.',
    timestamp: new Date()
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Hello! I\'m your AI calendar assistant. How can I help you with your schedule today?',
    timestamp: new Date()
  }
];

interface CalendarState {
  events: CalendarEvent[];
  calendars: Calendar[];
  user: User;
  currentDate: Date;
  view: ViewType;
  selectedEvent: CalendarEvent | null;
  selectedDate: Date | null;
  isModalOpen: boolean;
  isAiPanelOpen: boolean;
  aiSuggestions: AiSuggestion[];
  aiMessages: AiAssistantMessage[];
  filter: EventFilter;
  isLoading: boolean;
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setView: (view: ViewType) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  selectEvent: (event: CalendarEvent | null) => void;
  selectDate: (date: Date | null) => void;
  toggleModal: (isOpen: boolean) => void;
  toggleAiPanel: (isOpen: boolean) => void;
  updateCalendar: (calendar: Calendar) => void;
  updateUser: (user: Partial<User>) => void;
  addAiSuggestion: (suggestion: AiSuggestion) => void;
  dismissAiSuggestion: (id: string) => void;
  applyAiSuggestion: (id: string) => void;
  addAiMessage: (message: Omit<AiAssistantMessage, 'id' | 'timestamp'>) => void;
  updateFilter: (filter: Partial<EventFilter>) => void;
  setIsLoading: (isLoading: boolean) => void;
  getFilteredEvents: () => CalendarEvent[];
  getEventsByDateRange: (start: Date, end: Date) => CalendarEvent[];
  getEventsByDay: (date: Date) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: initialEvents,
      calendars: initialCalendars,
      user: initialUser,
      currentDate: new Date(),
      view: 'month',
      selectedEvent: null,
      selectedDate: null,
      isModalOpen: false,
      isAiPanelOpen: false,
      aiSuggestions: initialAiSuggestions,
      aiMessages: initialAiMessages,
      filter: {},
      isLoading: false,

      setCurrentDate: (date) => set({ currentDate: date }),
      
      setView: (view) => set({ view }),
      
      addEvent: (event) => set((state) => ({ 
        events: [...state.events, event] 
      })),
      
      updateEvent: (event) => set((state) => ({ 
        events: state.events.map((e) => (e.id === event.id ? event : e)) 
      })),
      
      deleteEvent: (id) => set((state) => ({ 
        events: state.events.filter((e) => e.id !== id) 
      })),
      
      selectEvent: (event) => set({ 
        selectedEvent: event,
        selectedDate: null,
        isModalOpen: event !== null 
      }),
      
      selectDate: (date) => set({ 
        selectedDate: date,
        selectedEvent: null,
        isModalOpen: date !== null 
      }),
      
      toggleModal: (isOpen) => set({ 
        isModalOpen: isOpen,
        selectedEvent: isOpen ? get().selectedEvent : null,
        selectedDate: isOpen ? get().selectedDate : null
      }),
      
      toggleAiPanel: (isOpen) => set({ isAiPanelOpen: isOpen }),
      
      updateCalendar: (calendar) => set((state) => ({ 
        calendars: state.calendars.map((c) => (c.id === calendar.id ? calendar : c)) 
      })),
      
      updateUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData } 
      })),
      
      addAiSuggestion: (suggestion) => set((state) => ({ 
        aiSuggestions: [...state.aiSuggestions, suggestion] 
      })),
      
      dismissAiSuggestion: (id) => set((state) => ({ 
        aiSuggestions: state.aiSuggestions.map((s) => 
          s.id === id ? { ...s, dismissed: true } : s
        ) 
      })),
      
      applyAiSuggestion: (id) => set((state) => {
        const suggestion = state.aiSuggestions.find((s) => s.id === id);
        if (suggestion?.suggestedEvent) {
          const newEvent: CalendarEvent = {
            id: Math.random().toString(36).substring(2, 9),
            title: suggestion.suggestedEvent.title || 'New Event',
            start: suggestion.suggestedEvent.start || new Date(),
            end: suggestion.suggestedEvent.end || addHours(suggestion.suggestedEvent.start || new Date(), 1),
            color: suggestion.suggestedEvent.color || '#4285F4',
            isAiGenerated: true,
            ...suggestion.suggestedEvent
          };
          
          return {
            events: [...state.events, newEvent],
            aiSuggestions: state.aiSuggestions.map((s) => 
              s.id === id ? { ...s, applied: true } : s
            )
          };
        }
        
        return {
          aiSuggestions: state.aiSuggestions.map((s) => 
            s.id === id ? { ...s, applied: true } : s
          )
        };
      }),
      
      addAiMessage: (message) => set((state) => ({ 
        aiMessages: [
          ...state.aiMessages, 
          { 
            ...message, 
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date() 
          }
        ] 
      })),
      
      updateFilter: (filter) => set((state) => ({ 
        filter: { ...state.filter, ...filter } 
      })),
      
      setIsLoading: (isLoading) => set({ isLoading }),
      
      getFilteredEvents: () => {
        const { events, filter } = get();
        let filteredEvents = [...events];
        
        if (filter.calendars?.length) {
          filteredEvents = filteredEvents.filter((event) => 
            filter.calendars?.includes(event.category || '')
          );
        }
        
        if (filter.categories?.length) {
          filteredEvents = filteredEvents.filter((event) => 
            filter.categories?.includes(event.category || '')
          );
        }
        
        if (filter.tags?.length) {
          filteredEvents = filteredEvents.filter((event) => 
            event.tags?.some((tag) => filter.tags?.includes(tag))
          );
        }
        
        if (filter.priorities?.length) {
          filteredEvents = filteredEvents.filter((event) => 
            filter.priorities?.includes(event.priority || 'medium')
          );
        }
        
        if (filter.dateRange) {
          filteredEvents = filteredEvents.filter((event) => 
            event.start >= filter.dateRange!.start && 
            event.end <= filter.dateRange!.end
          );
        }
        
        if (filter.searchText) {
          const searchLower = filter.searchText.toLowerCase();
          filteredEvents = filteredEvents.filter((event) => 
            event.title.toLowerCase().includes(searchLower) || 
            event.description?.toLowerCase().includes(searchLower) ||
            event.location?.toLowerCase().includes(searchLower)
          );
        }
        
        if (filter.showCompleted === false) {
          filteredEvents = filteredEvents.filter((event) => !event.completed);
        }
        
        return filteredEvents;
      },
      
      getEventsByDateRange: (start, end) => {
        const { events } = get();
        return events.filter((event) => 
          (event.start >= start && event.start <= end) || 
          (event.end >= start && event.end <= end) ||
          (event.start <= start && event.end >= end)
        );
      },
      
      getEventsByDay: (date) => {
        const { events } = get();
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        return events.filter((event) => 
          (event.start >= dayStart && event.start <= dayEnd) || 
          (event.end >= dayStart && event.end <= dayEnd) ||
          (event.start <= dayStart && event.end >= dayEnd)
        );
      }
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({
        events: state.events,
        calendars: state.calendars,
        user: state.user
      })
    }
  )
);

// Helper function
function addHours(date: Date, hours: number): Date {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
}