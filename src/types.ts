export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  description?: string;
  location?: string;
  attendees?: Attendee[];
  recurrence?: RecurrenceRule;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  notifications?: Notification[];
  completed?: boolean;
  category?: string;
  isAllDay?: boolean;
  attachments?: Attachment[];
  notes?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  timeEstimate?: number; // in minutes
  timeSpent?: number; // in minutes
  relatedEvents?: string[]; // IDs of related events
  weather?: WeatherInfo;
  travelTime?: number; // in minutes
  isAiGenerated?: boolean;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  isOrganizer?: boolean;
  responseTime?: Date;
  notes?: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  endDate?: Date;
  endAfterOccurrences?: number;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  monthsOfYear?: number[];
  excludeDates?: Date[];
}

export interface Notification {
  id: string;
  time: number; // minutes before event
  type: 'email' | 'push' | 'sms';
  message?: string;
  sent?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface WeatherInfo {
  temperature?: number;
  condition?: string;
  icon?: string;
  precipitation?: number;
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
  isDefault?: boolean;
  owner?: string;
  shared?: boolean;
  type?: 'personal' | 'work' | 'shared' | 'holiday' | 'custom';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: UserPreferences;
  timeZone?: string;
}

export interface UserPreferences {
  defaultView: ViewType;
  defaultCalendar: string;
  workingHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
    workDays: number[]; // 0-6, where 0 is Sunday
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  firstDayOfWeek: number; // 0-6, where 0 is Sunday
  showWeekends: boolean;
  showDeclinedEvents: boolean;
  showCompleted: boolean;
  timeFormat: '12h' | '24h';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  autoDetectLocation: boolean;
}

export interface AiSuggestion {
  id: string;
  type: 'reschedule' | 'new-event' | 'optimization' | 'reminder' | 'conflict';
  message: string;
  relatedEventIds?: string[];
  suggestedEvent?: Partial<CalendarEvent>;
  confidence: number; // 0-1
  createdAt: Date;
  dismissed?: boolean;
  applied?: boolean;
}

export interface TimeBlock {
  id: string;
  start: Date;
  end: Date;
  type: 'focus' | 'break' | 'meeting' | 'personal' | 'travel';
  label?: string;
}

export interface EventAnalytics {
  totalEvents: number;
  completedEvents: number;
  canceledEvents: number;
  averageDuration: number;
  mostProductiveDay: string;
  mostProductiveTime: string;
  categoryBreakdown: Record<string, number>;
  timeSpentByCategory: Record<string, number>;
  trendsOverTime: {
    date: string;
    count: number;
  }[];
}

export type ViewType = 'month' | 'week' | 'day' | 'agenda' | 'timeline' | 'year' | 'gantt' | 'focus';

export interface EventFilter {
  calendars?: string[];
  categories?: string[];
  tags?: string[];
  priorities?: ('low' | 'medium' | 'high')[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchText?: string;
  showCompleted?: boolean;
}

export interface AiAssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AiAssistantContext {
  recentEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  userPreferences: UserPreferences;
  previousSuggestions: AiSuggestion[];
  currentDate: Date;
  currentView: ViewType;
}