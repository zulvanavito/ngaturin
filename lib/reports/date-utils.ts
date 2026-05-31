import { startOfMonth, endOfMonth, getDaysInMonth as dateFnsGetDaysInMonth, isFuture, isSameMonth, subMonths, format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export function getCurrentMonth(): string {
  return format(new Date(), "yyyy-MM");
}

export function getPreviousMonth(month: string): string {
  try {
    const date = new Date(`${month}-01T00:00:00`);
    const prev = subMonths(date, 1);
    return format(prev, "yyyy-MM");
  } catch (error) {
    return getCurrentMonth();
  }
}

export function getMonthDateRange(month: string): { start: Date; end: Date } {
  const date = new Date(`${month}-01T00:00:00`);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getDaysInMonth(month: string): number {
  try {
    return dateFnsGetDaysInMonth(new Date(`${month}-01T00:00:00`));
  } catch (error) {
    return 30;
  }
}

export function getElapsedDaysInMonth(month: string): number {
  try {
    const date = new Date(`${month}-01T00:00:00`);
    if (isFuture(date) && !isSameMonth(date, new Date())) {
      return 0; // Future month
    }
    if (isSameMonth(date, new Date())) {
      return new Date().getDate(); // Current month elapsed days
    }
    // Past month
    return getDaysInMonth(month);
  } catch (error) {
    return 30;
  }
}

export function isCurrentMonth(month: string): boolean {
  try {
    return isSameMonth(new Date(`${month}-01T00:00:00`), new Date());
  } catch (error) {
    return false;
  }
}

export function isFutureMonth(month: string): boolean {
  try {
    const date = new Date(`${month}-01T00:00:00`);
    return isFuture(date) && !isSameMonth(date, new Date());
  } catch (error) {
    return false;
  }
}

export function formatDateId(date: Date): string {
  return format(date, "d MMMM yyyy", { locale: id });
}
