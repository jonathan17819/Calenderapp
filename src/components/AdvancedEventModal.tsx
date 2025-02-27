import React, { useState, useEffect } from 'react';
import { X, MapPin, Users, Clock, Calendar as CalendarIcon, Tag, Bell, Paperclip, MoreHorizontal, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CalendarEvent, Attendee, Notification, RecurrenceRule } from '../types';
import { getTimeFromDate, setTimeToDate, formatDate } from '../utils/dateUtils';
import { useCalendarStore } from '../store/calendarStore';

interface AdvancedEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  event?: CalendarEvent;
  selectedDate?: Date;
}

const colorOptions = [
  '#4285F4', // Blue
  '#EA4335', // Red
  '#FBBC05', // Yellow
  '#34A853', // Green
  '#8E24AA', // Purple
  '#F6BF26', // Gold
  '#039BE5', // Light Blue
  '#0B8043', // Dark Green
];

const categoryOptions = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'family', label: 'Family' },
  { value: 'health', label: 'Health' },
  { value: 'social', label: 'Social' },
  { value: 'education', label: 'Education' },
  { value: 'finance', label: 'Finance' },
  { value: 'travel', label: 'Travel' },
  { value: 'other', label: 'Other' }
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const AdvancedEventModal: React.FC<AdvancedEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState({ hours: 9, minutes: 0 });
  const [endTime, setEndTime] = useState({ hours: 10, minutes: 0 });
  const [isAllDay, setIsAllDay] = useState(false);
  const [color, setColor] = useState(colorOptions[0]);
  const [category, setCategory] = useState('work');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(undefined);
  const [recurrenceEndAfter, setRecurrenceEndAfter] = useState<number | undefined>(undefined);
  const [recurrenceEndType, setRecurrenceEndType] = useState<'never' | 'after' | 'on'>('never');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const { user } = useCalendarStore();
  
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setStartDate(event.start);
      setEndDate(event.end);
      setStartTime(getTimeFromDate(event.start));
      setEndTime(getTimeFromDate(event.end));
      setIsAllDay(event.isAllDay || false);
      setColor(event.color);
      setCategory(event.category || 'work');
      setPriority(event.priority || 'medium');
      setTags(event.tags || []);
      setAttendees(event.attendees || []);
      setNotifications(event.notifications || []);
      
      if (event.recurrence) {
        setIsRecurring(true);
        setRecurrence(event.recurrence);
        setRecurrenceFrequency(event.recurrence.frequency);
        setRecurrenceInterval(event.recurrence.interval || 1);
        
        if (event.recurrence.endDate) {
          setRecurrenceEndType('on');
          setRecurrenceEndDate(event.recurrence.endDate);
        } else if (event.recurrence.endAfterOccurrences) {
          setRecurrenceEndType('after');
          setRecurrenceEndAfter(event.recurrence.endAfterOccurrences);
        } else {
          setRecurrenceEndType('never');
        }
      } else {
        setIsRecurring(false);
        setRecurrence(undefined);
      }
    } else if (selectedDate) {
      setStartDate(selectedDate);
      setEndDate(selectedDate);
      
      // Default to current time rounded to nearest half hour
      const now = new Date();
      const minutes = now.getMinutes();
      const roundedMinutes = minutes < 30 ? 30 : 0;
      const hours = minutes < 30 ? now.getHours() : now.getHours() + 1;
      
      setStartTime({ hours, minutes: roundedMinutes });
      setEndTime({ 
        hours: roundedMinutes === 30 ? hours + 1 : hours,
        minutes: roundedMinutes === 30 ? 0 : 30
      });
      
      // Add current user as organizer
      setAttendees([
        {
          id: user.id,
          name: user.name,
          email: user.email,
          status: 'accepted',
          isOrganizer: true
        }
      ]);
      
      // Add default notification
      setNotifications([
        {
          id: '1',
          time: 15,
          type: 'push'
        }
      ]);
    }
  }, [event, selectedDate, user]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let start = startDate;
    let end = endDate;
    
    if (!isAllDay) {
      start = setTimeToDate(startDate, startTime.hours, startTime.minutes);
      end = setTimeToDate(endDate, endTime.hours, endTime.minutes);
    } else {
      // For all-day events, set time to start of day for start and end of day for end
      start = new Date(startDate.setHours(0, 0, 0, 0));
      end = new Date(endDate.setHours(23, 59, 59, 999));
    }
    
    // Prepare recurrence rule if event is recurring
    let finalRecurrence: RecurrenceRule | undefined = undefined;
    
    if (isRecurring) {
      finalRecurrence = {
        frequency: recurrenceFrequency,
        interval: recurrenceInterval
      };
      
      if (recurrenceEndType === 'on' && recurrenceEndDate) {
        finalRecurrence.endDate = recurrenceEndDate;
      } else if (recurrenceEndType === 'after' && recurrenceEndAfter) {
        finalRecurrence.endAfterOccurrences = recurrenceEndAfter;
      }
    }
    
    onSave({
      id: event?.id || Math.random().toString(36).substring(2, 9),
      title,
      description,
      location,
      start,
      end,
      color,
      isAllDay,
      category,
      priority,
      tags,
      attendees,
      notifications,
      recurrence: finalRecurrence,
      createdBy: user.id,
      createdAt: event?.createdAt || new Date(),
      updatedAt: new Date()
    });
    
    onClose();
  };
  
  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };
  
  const formatTimeForInput = (time: { hours: number, minutes: number }): string => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  };
  
  const parseTimeInput = (timeString: string): { hours: number, minutes: number } => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleAddAttendee = () => {
    if (attendeeInput.trim() && !attendees.some(a => a.email === attendeeInput.trim())) {
      const newAttendee: Attendee = {
        id: Math.random().toString(36).substring(2, 9),
        name: attendeeInput.trim(),
        email: attendeeInput.trim(),
        status: 'pending'
      };
      
      setAttendees([...attendees, newAttendee]);
      setAttendeeInput('');
    }
  };
  
  const handleRemoveAttendee = (id: string) => {
    setAttendees(attendees.filter(a => a.id !== id));
  };
  
  const handleAddNotification = () => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(2, 9),
      time: 15,
      type: 'push'
    };
    
    setNotifications([...notifications, newNotification]);
  };
  
  const handleUpdateNotification = (id: string, time: number, type: 'email' | 'push' | 'sms') => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, time, type } : n
    ));
  };
  
  const handleRemoveNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {event ? 'Edit Event' : 'Add Event'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'attendees' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('attendees')}
          >
            Attendees
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'reminders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('reminders')}
          >
            Reminders
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-4">
              <div className="mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add title"
                  className="w-full px-3 py-2 text-lg font-medium border-b focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-8">
                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <input
                      type="date"
                      value={startDate.toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                      className="px-2 py-1 border rounded mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                    {!isAllDay && (
                      <input
                        type="time"
                        value={formatTimeForInput(startTime)}
                        onChange={(e) => setStartTime(parseTimeInput(e.target.value))}
                        className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    )}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="date"
                      value={endDate.toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(new Date(e.target.value))}
                      className="px-2 py-1 border rounded mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                    {!isAllDay && (
                      <input
                        type="time"
                        value={formatTimeForInput(endTime)}
                        onChange={(e) => setEndTime(parseTimeInput(e.target.value))}
                        className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={isAllDay}
                      onChange={(e) => setIsAllDay(e.target.checked)}
                      className="mr-2"
                    />
                    All day
                  </label>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-8">
                  <MapPin className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                  className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              {isRecurring && (
                <div className="flex items-start mb-4">
                  <div className="w-8">
                    <Clock className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <select
                        value={recurrenceFrequency}
                        onChange={(e) => setRecurrenceFrequency(e.target.value as any)}
                        className="px-2 py-1 border rounded mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      
                      <select
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(parseInt(e.target.value))}
                        className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>
                            {num === 1 ? 'Every' : `Every ${num}`}
                          </option>
                        ))}
                      </select>
                      
                      <span className="ml-2 text-sm text-gray-600">
                        {recurrenceFrequency === 'daily' && (recurrenceInterval === 1 ? 'day' : 'days')}
                        {recurrenceFrequency === 'weekly' && (recurrenceInterval === 1 ? 'week' : 'weeks')}
                        {recurrenceFrequency === 'monthly' && (recurrenceInterval === 1 ? 'month' : 'months')}
                        {recurrenceFrequency === 'yearly' && (recurrenceInterval === 1 ? 'year' : 'years')}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <span className="text-sm mr-2">Ends:</span>
                      <select
                        value={recurrenceEndType}
                        onChange={(e) => setRecurrenceEndType(e.target.value as any)}
                        className="px-2 py-1 border rounded mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="never">Never</option>
                        <option value="after">After</option>
                        <option value="on">On date</option>
                      </select>
                      
                      {recurrenceEndType === 'after' && (
                        <input
                          type="number"
                          min="1"
                          value={recurrenceEndAfter || ''}
                          onChange={(e) => setRecurrenceEndAfter(parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border rounded mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="10"
                        />
                      )}
                      
                      {recurrenceEndType === 'after' && (
                        <span className="text-sm text-gray-600">occurrences</span>
                      )}
                      
                      {recurrenceEndType === 'on' && (
                        <input
                          type="date"
                          value={recurrenceEndDate?.toISOString().split('T')[0] || ''}
                          onChange={(e) => setRecurrenceEndDate(new Date(e.target.value))}
                          className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start mb-4">
                <div className="w-8 pt-2">
                  <Tag className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <div key={tag} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tags"
                      className="flex-1 px-2 py-1 border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1 bg-gray-100 border border-l-0 rounded-r hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add description"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-6 w-6 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  {showAdvancedOptions ? 'Hide advanced options' : 'Show advanced options'}
                </button>
              </div>
              
              {showAdvancedOptions && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <div className="mb-3">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="mr-2"
                      />
                      Recurring event
                    </label>
                  </div>
                  
                  {/* Additional advanced options could go here */}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'attendees' && (
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendees
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAttendee())}
                    placeholder="Add attendee (name or email)"
                    className="flex-1 px-2 py-1 border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttendee}
                    className="px-3 py-1 bg-gray-100 border border-l-0 rounded-r hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                {attendees.length > 0 ? (
                  <div className="border rounded divide-y">
                    {attendees.map(attendee => (
                      <div key={attendee.id} className="flex items-center justify-between p-2">
                        <div>
                          <div className="font-medium">{attendee.name}</div>
                          <div className="text-sm text-gray-500">{attendee.email}</div>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                            attendee.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            attendee.status === 'declined' ? 'bg-red-100 text-red-800' :
                            attendee.status === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1)}
                          </span>
                          {!attendee.isOrganizer && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAttendee(attendee.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No attendees added
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'reminders' && (
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Notifications
                  </label>
                  <button
                    type="button"
                    onClick={handleAddNotification}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Add notification
                  </button>
                </div>
                
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map(notification => (
                      <div key={notification.id} className="flex items-center border rounded p-2">
                        <select
                          value={notification.time}
                          onChange={(e) => handleUpdateNotification(notification.id, parseInt(e.target.value), notification.type)}
                          className="px-2 py-1 border rounded mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value={0}>At time of event</option>
                          <option value={5}>5 minutes before</option>
                          <option value={10}>10 minutes before</option>
                          <option value={15}>15 minutes before</option>
                          <option value={30}>30 minutes before</option>
                          <option value={60}>1 hour before</option>
                          <option value={120}>2 hours before</option>
                          <option value={1440}>1 day before</option>
                        </select>
                        
                        <select
                          value={notification.type}
                          onChange={(e) => handleUpdateNotification(notification.id, notification.time, e.target.value as any)}
                          className="px-2 py-1 border rounded mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="push">Notification</option>
                          <option value="email">Email</option>
                          <option value="sms">SMS</option>
                        </select>
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveNotification(notification.id)}
                          className="ml-auto text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No notifications set
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
        
        <div className="flex justify-between p-4 border-t">
          {event && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          )}
          <div className="flex space-x-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedEventModal;