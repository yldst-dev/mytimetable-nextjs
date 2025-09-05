export interface Class {
  name: string;
  room: string;
  professor: string;
  code?: string;
}

export interface TimeSlot {
  period: string;
  time: string;
  classes: {
    mon: Class | null;
    tue: Class | null;
    wed: Class | null;
    thu: Class | null;
    fri: Class | null;
  };
}

export interface ScheduleData {
  scheduleData: TimeSlot[];
}

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export const PROFESSOR_COLORS: Record<string, string> = {
  "김경희": "bg-blue-600",
  "채미혜": "bg-emerald-600", 
  "윤영미": "bg-indigo-600",
  "최유석": "bg-violet-600",
  "박현수": "bg-orange-600",
  "김민영": "bg-teal-600",
  "최낙윤": "bg-rose-600",
  "none": "bg-slate-400"
};

export const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: '월요일' },
  { key: 'tue', label: '화요일' },
  { key: 'wed', label: '수요일' },
  { key: 'thu', label: '목요일' },
  { key: 'fri', label: '금요일' },
];