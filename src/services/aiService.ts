import { CalendarEvent, AiSuggestion, AiAssistantMessage, AiAssistantContext } from '../types';
import { useCalendarStore } from '../store/calendarStore';
import { addDays, format, differenceInMinutes, isBefore, isAfter, parseISO } from 'date-fns';

// Mock OpenAI API for demo purposes
// In a real application, you would use the actual OpenAI API
class MockOpenAI {
  async generateSuggestions(events: CalendarEvent[], context: AiAssistantContext): Promise<AiSuggestion[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions: AiSuggestion[] = [];
    
    // Check for back-to-back meetings
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
    
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i];
      const nextEvent = sortedEvents[i + 1];
      
      // If events are on the same day and less than 15 minutes apart
      if (
        format(currentEvent.end, 'yyyy-MM-dd') === format(nextEvent.start, 'yyyy-MM-dd') &&
        differenceInMinutes(nextEvent.start, currentEvent.end) < 15 &&
        differenceInMinutes(nextEvent.start, currentEvent.end) >= 0
      ) {
        suggestions.push({
          id: Math.random().toString(36).substring(2, 9),
          type: 'optimization',
          message: `You have back-to-back meetings: "${currentEvent.title}" and "${nextEvent.title}". Would you like to add a 15-minute break between them?`,
          confidence: 0.85,
          createdAt: new Date(),
          relatedEventIds: [currentEvent.id, nextEvent.id]
        });
      }
    }
    
    // Suggest focus time if there's a gap in the schedule
    const workStart = parseTime(context.userPreferences.workingHours.start);
    const workEnd = parseTime(context.userPreferences.workingHours.end);
    
    const tomorrow = addDays(new Date(), 1);
    const tomorrowEvents = events.filter(event => 
      format(event.start, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')
    );
    
    if (tomorrowEvents.length < 3) {
      // Suggest a focus time block in the morning
      suggestions.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'new-event',
        message: 'You have some free time tomorrow morning. Would you like to schedule a focus time block?',
        confidence: 0.75,
        createdAt: new Date(),
        suggestedEvent: {
          title: 'Focus Time',
          start: new Date(tomorrow.setHours(9, 0, 0, 0)),
          end: new Date(tomorrow.setHours(11, 0, 0, 0)),
          color: '#8E24AA',
          category: 'work',
          tags: ['focus', 'productivity'],
          isAiGenerated: true
        }
      });
    }
    
    // Check for conflicts
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];
        
        if (
          (isAfter(event1.start, event2.start) && isBefore(event1.start, event2.end)) ||
          (isAfter(event1.end, event2.start) && isBefore(event1.end, event2.end)) ||
          (isBefore(event1.start, event2.start) && isAfter(event1.end, event2.end))
        ) {
          suggestions.push({
            id: Math.random().toString(36).substring(2, 9),
            type: 'conflict',
            message: `There's a scheduling conflict between "${event1.title}" and "${event2.title}". Would you like me to suggest an alternative time?`,
            confidence: 0.9,
            createdAt: new Date(),
            relatedEventIds: [event1.id, event2.id]
          });
          break; // Only report one conflict per event
        }
      }
    }
    
    return suggestions;
  }
  
  async chatCompletion(messages: AiAssistantMessage[], context: AiAssistantContext): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.role !== 'user') {
      return "I'm here to help you manage your calendar. What can I assist you with?";
    }
    
    const userMessage = lastMessage.content.toLowerCase();
    
    // Simple pattern matching for demo purposes
    if (userMessage.includes('schedule') || userMessage.includes('create') || userMessage.includes('add')) {
      if (userMessage.includes('meeting')) {
        return "I'd be happy to schedule a meeting for you. What's the title, date, and time for this meeting?";
      } else if (userMessage.includes('appointment')) {
        return "I can help you add an appointment. Please provide the details like date, time, and who it's with.";
      } else {
        return "I can help you schedule something. What type of event would you like to add to your calendar?";
      }
    } else if (userMessage.includes('free') || userMessage.includes('available')) {
      return "Looking at your calendar for the next few days, you have some free time tomorrow between 2-4 PM and Friday morning before 11 AM. Would you like me to block any of these times for you?";
    } else if (userMessage.includes('busy') || userMessage.includes('schedule look')) {
      return `You have ${context.upcomingEvents.length} events coming up in the next week. The busiest day appears to be ${format(context.upcomingEvents[0]?.start || new Date(), 'EEEE')} with ${context.upcomingEvents.filter(e => format(e.start, 'yyyy-MM-dd') === format(context.upcomingEvents[0]?.start || new Date(), 'yyyy-MM-dd')).length} events scheduled.`;
    } else if (userMessage.includes('reschedule') || userMessage.includes('move')) {
      return "Which event would you like to reschedule? I can suggest some alternative times based on your availability.";
    } else if (userMessage.includes('cancel') || userMessage.includes('delete')) {
      return "Which event would you like to cancel? Please provide the name or date of the event.";
    } else if (userMessage.includes('remind') || userMessage.includes('notification')) {
      return "I can set up reminders for your events. Would you like me to add notifications to a specific event or set up default reminder preferences?";
    } else if (userMessage.includes('conflict') || userMessage.includes('overlap')) {
      return "I've checked your calendar and found a potential conflict between your team meeting and client lunch tomorrow. Would you like me to suggest an alternative time for one of these?";
    } else if (userMessage.includes('analyze') || userMessage.includes('insights')) {
      return "Based on your calendar data, you spend about 40% of your work time in meetings, with Tuesday being your busiest day. You might want to consider blocking some focus time on Tuesdays to balance your schedule.";
    } else if (userMessage.includes('optimize') || userMessage.includes('improve')) {
      return "I notice you have several short meetings scattered throughout your day. Would you like me to suggest grouping them together to create larger blocks of focused work time?";
    } else if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey')) {
      return "Hello! I'm your AI calendar assistant. I can help you manage your schedule, create events, find free time, and optimize your calendar. How can I assist you today?";
    } else if (userMessage.includes('thank')) {
      return "You're welcome! Let me know if you need any other assistance with your calendar.";
    } else if (userMessage.includes('help')) {
      return "I can help you with various calendar tasks like scheduling events, finding free time, rescheduling meetings, setting reminders, resolving conflicts, and providing insights about your schedule. What would you like help with?";
    } else {
      return "I'm here to help with your calendar management. I can schedule events, find free time, suggest optimizations, or provide insights about your schedule. How can I assist you?";
    }
  }
}

// Helper function to parse time string (HH:MM) to Date object
function parseTime(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Create AI service instance
const mockOpenAI = new MockOpenAI();

export const aiService = {
  async generateSuggestions(): Promise<AiSuggestion[]> {
    const store = useCalendarStore.getState();
    const events = store.events;
    const currentDate = store.currentDate;
    const user = store.user;
    
    // Create context for AI
    const context: AiAssistantContext = {
      recentEvents: events.filter(e => isBefore(e.start, currentDate)).slice(-5),
      upcomingEvents: events.filter(e => isAfter(e.start, currentDate)).slice(0, 10),
      userPreferences: user.preferences!,
      previousSuggestions: store.aiSuggestions,
      currentDate,
      currentView: store.view
    };
    
    try {
      store.setIsLoading(true);
      const suggestions = await mockOpenAI.generateSuggestions(events, context);
      store.setIsLoading(false);
      return suggestions;
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      store.setIsLoading(false);
      return [];
    }
  },
  
  async sendMessage(message: string): Promise<string> {
    const store = useCalendarStore.getState();
    const events = store.events;
    const currentDate = store.currentDate;
    const user = store.user;
    
    // Add user message to the store
    store.addAiMessage({
      role: 'user',
      content: message
    });
    
    // Create context for AI
    const context: AiAssistantContext = {
      recentEvents: events.filter(e => isBefore(e.start, currentDate)).slice(-5),
      upcomingEvents: events.filter(e => isAfter(e.start, currentDate)).slice(0, 10),
      userPreferences: user.preferences!,
      previousSuggestions: store.aiSuggestions,
      currentDate,
      currentView: store.view
    };
    
    try {
      store.setIsLoading(true);
      const response = await mockOpenAI.chatCompletion(store.aiMessages, context);
      
      // Add assistant response to the store
      store.addAiMessage({
        role: 'assistant',
        content: response
      });
      
      store.setIsLoading(false);
      return response;
    } catch (error) {
      console.error('Error in AI chat completion:', error);
      
      // Add error message
      store.addAiMessage({
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again."
      });
      
      store.setIsLoading(false);
      return "I'm sorry, I encountered an error processing your request. Please try again.";
    }
  },
  
  async refreshSuggestions(): Promise<void> {
    const suggestions = await this.generateSuggestions();
    const store = useCalendarStore.getState();
    
    // Add new suggestions to the store
    suggestions.forEach(suggestion => {
      store.addAiSuggestion(suggestion);
    });
  }
};