const MINUTE_IN_MS = 1000 * 60;
const DAY_IN_MS = 1000 * 60 * 60 * 24;
const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const satisfies string[];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const satisfies string[];

export const getMinutesInMS = (minutes: number) => minutes * MINUTE_IN_MS;

export const getWeekdayName = (dayIndex: number, letters?: number) =>
  DAYS_OF_WEEK[dayIndex].substring(0, letters);

export const getMonthName = (monthIndex: number, letters?: number) =>
  MONTHS[monthIndex].substring(0, letters);

export const getMomentZeroDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const getMomentZero = (date: Date): number =>
  getMomentZeroDate(date).getTime();

export const areSameDates = (date1: Date, date2: Date) =>
  getMomentZero(date1) === getMomentZero(date2);

export const isFutureDay = (date: Date, referenceDate?: Date) => {
  const refDate = referenceDate || new Date();
  return getMomentZero(date) > getMomentZero(refDate);
};

export const getDaysGap = (earlierDate: Date, laterDate: Date): number => {
  const earlierDateMZ = getMomentZero(earlierDate);
  const laterDateMZ = getMomentZero(laterDate);
  return Math.round((laterDateMZ - earlierDateMZ) / DAY_IN_MS);
};

export const getDateGapFromToday = (date: Date): number =>
  getDaysGap(new Date(), date);

export const getGapDate = (baseDate: Date, daysGap: number): Date =>
  new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() + daysGap
  );

export const getMonthFirstDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const getMonthLastDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const getLastNDays = (date: Date, n: number) => {
  if (n < 1) throw `N should be some positive integer`;
  const time = getMomentZero(date);
  return Array(n)
    .fill(0)
    .map((_, i) => new Date(time - (n - 1 - i) * DAY_IN_MS));
};

export const getLastTwoWeeks = (date: Date) => {
  const time = date.getTime();
  const gapFromSaturday = 6 - (date.getDay() % 7);
  const saturday = new Date(time + gapFromSaturday * DAY_IN_MS);
  return getLastNDays(saturday, 14);
};

export const getMonthFirstDates = (monthsCount: number) => {
  const today = new Date();
  return Array(monthsCount)
    .fill(0)
    .map((_, i) => new Date(today.getFullYear(), today.getMonth() - i, 1))
    .reverse();
};

export const getSunday = (date: Date): Date => {
  const gapBetweenSundayAndDate = date.getDay();
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - gapBetweenSundayAndDate
  );
};

export const getSaturday = (date: Date): Date => {
  const gapBetweenDateAndSaturday = 6 - date.getDay();
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + gapBetweenDateAndSaturday
  );
};

export const getDatesArrayBetweenDates = (date1: Date, date2: Date) => {
  const time1 = getMomentZero(date1);
  const time2 = getMomentZero(date2);

  if (time1 === time2) return [getMomentZeroDate(new Date(time1))];
  const earlierTime = time1 < time2 ? time1 : time2;
  const laterTime = time1 < time2 ? time2 : time1;
  const daysGap = (laterTime - earlierTime) / DAY_IN_MS;

  return Array(daysGap + 1)
    .fill(0)
    .map((_, i) => new Date(earlierTime + i * DAY_IN_MS));
};

export const getDateWindow = (monthsCount: number) => {
  if (monthsCount < 1) throw ``;

  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const startDate = new Date(year, monthIndex - (monthsCount - 1), 1);
  const endDate = new Date(year, monthIndex + 1, 0);
  return { startDate, endDate };
};
