export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY;
export const DAYS_PER_YEAR = 365;
export const MINUTES_PER_YEAR = MINUTES_PER_DAY * DAYS_PER_YEAR;

export function addYears(time: number, years: number): number {
  return time + years * MINUTES_PER_YEAR;
}

export function ageInYears(now: number, birthDate: number): number {
  return Math.floor((now - birthDate) / MINUTES_PER_YEAR);
}

export function yearFromDate(time: number): number {
  return Math.floor(time / MINUTES_PER_YEAR);
}