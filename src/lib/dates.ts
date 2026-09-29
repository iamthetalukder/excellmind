// Calendar dates in Bangladesh time (UTC+6, no DST), as YYYY-MM-DD strings.
// Dates are computed here rather than from the runtime's clock, because the server
// (Vercel, UTC) and the student's browser can disagree about what day it is.

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function dhakaToday(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

// Arithmetic runs on UTC midnights so the runtime's own timezone can't shift the result.
function toUtcMidnight(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(date: string, days: number): string {
  const result = toUtcMidnight(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcMidnight(to).getTime() - toUtcMidnight(from).getTime()) / 86400000);
}

export function weekdayName(date: string): string {
  return DAY_NAMES[toUtcMidnight(date).getUTCDay()];
}
