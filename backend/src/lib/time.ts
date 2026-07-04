const SLOT_DURATION = 30;

export function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addMinutes(time: string, mins: number): string {
  return formatTime(parseTime(time) + mins);
}

export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

export function isWeekday(date: Date): boolean {
  const day = getDayOfWeek(date);
  return day >= 1 && day <= 6;
}

export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(date);
  check.setHours(0, 0, 0, 0);
  return check < today;
}

export function generateSlots(startTime: string, endTime: string, slotMins: number): string[] {
  const slots: string[] = [];
  let current = parseTime(startTime);
  const end = parseTime(endTime);
  while (current + slotMins <= end) {
    slots.push(formatTime(current));
    current += slotMins;
  }
  return slots;
}

export { SLOT_DURATION };
