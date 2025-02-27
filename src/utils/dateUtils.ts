import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getHours,
  getMinutes,
  setHours,
  setMinutes
} from 'date-fns';

export const getCalendarDays = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

export const formatDate = (date: Date, formatStr: string): string => {
  return format(date, formatStr);
};

export const isCurrentMonth = (date: Date, currentMonth: Date): boolean => {
  return isSameMonth(date, currentMonth);
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const nextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

export const previousMonth = (date: Date): Date => {
  return subMonths(date, 1);
};

export const formatEventTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

export const getTimeFromDate = (date: Date): { hours: number, minutes: number } => {
  return {
    hours: getHours(date),
    minutes: getMinutes(date)
  };
};

export const setTimeToDate = (date: Date, hours: number, minutes: number): Date => {
  return setMinutes(setHours(date, hours), minutes);
};