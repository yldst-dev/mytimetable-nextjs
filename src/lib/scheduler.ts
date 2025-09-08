import { ScheduleData, DayOfWeek } from '@/types/schedule';
import { NotificationManager, ScheduledNotification, NotificationConfig } from './notifications';

export interface ClassReminder {
  id: string;
  day: DayOfWeek;
  period: string;
  time: string;
  classInfo: {
    name: string;
    room: string;
    professor: string;
    period: string;
    day: string;
  };
  reminderTime: Date;
  attendanceCheckTime: Date;
}

export class NotificationScheduler {
  private static instance: NotificationScheduler;
  private notificationManager: NotificationManager;
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.notificationManager = NotificationManager.getInstance();
  }

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  private parseTimeToMinutes(timeString: string): number {
    const [time] = timeString.split('~');
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private createDateFromTime(day: DayOfWeek, timeString: string): Date {
    const now = new Date();
    const targetDate = new Date(now);
    
    const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDay = targetDate.getDay();
    const targetDay = daysOfWeek.indexOf(day);
    
    const daysUntilTarget = targetDay - currentDay;
    const adjustedDays = daysUntilTarget < 0 ? daysUntilTarget + 7 : daysUntilTarget;
    
    targetDate.setDate(targetDate.getDate() + adjustedDays);
    
    const timeMinutes = this.parseTimeToMinutes(timeString);
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    
    targetDate.setHours(hours, minutes, 0, 0);
    
    if (targetDate.getTime() <= now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 7);
    }
    
    return targetDate;
  }

  private createReminderFromSchedule(scheduleData: ScheduleData): ClassReminder[] {
    const reminders: ClassReminder[] = [];

    scheduleData.scheduleData.forEach((periodData) => {
      const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
      
      days.forEach((day) => {
        const classInfo = periodData.classes[day];
        if (!classInfo) return;

        const classStartTime = this.createDateFromTime(day, periodData.time);
        const reminderTime = new Date(classStartTime.getTime() - 10 * 60 * 1000); // 10분 전
        const attendanceCheckTime = new Date(classStartTime.getTime()); // 정확히 시작 시간

        const reminder: ClassReminder = {
          id: `${day}-${periodData.period}-reminder`,
          day,
          period: periodData.period,
          time: periodData.time,
          classInfo: {
            name: classInfo.name,
            room: classInfo.room,
            professor: classInfo.professor,
            period: periodData.period,
            day: this.getDayKorean(day)
          },
          reminderTime,
          attendanceCheckTime
        };

        reminders.push(reminder);
      });
    });

    return reminders;
  }

  private getDayKorean(day: DayOfWeek): string {
    const dayMap = {
      mon: '월요일',
      tue: '화요일',
      wed: '수요일',
      thu: '목요일',
      fri: '금요일'
    };
    return dayMap[day];
  }

  private createReminderNotification(reminder: ClassReminder): NotificationConfig {
    return {
      title: `🔔 수업 알림 - ${reminder.classInfo.name}`,
      body: `${reminder.time}에 ${reminder.classInfo.name} 수업이 곧 시작됩니다.\n교수: ${reminder.classInfo.professor}\n위치: ${reminder.classInfo.room}`,
      icon: '/icons/icon-192x192.png',
      tag: `class-reminder-${reminder.id}`,
      requireInteraction: true
    };
  }

  private createAttendanceNotification(reminder: ClassReminder): NotificationConfig {
    return {
      title: `📍 출석 확인 - ${reminder.classInfo.name}`,
      body: `${reminder.classInfo.name} 수업이 시작되었습니다!\n출석을 확인해주세요.\n위치: ${reminder.classInfo.room}`,
      icon: '/icons/icon-192x192.png',
      tag: `attendance-check-${reminder.id}`,
      requireInteraction: true
    };
  }

  scheduleNotifications(scheduleData: ScheduleData): void {
    this.clearAllScheduledNotifications();
    
    const reminders = this.createReminderFromSchedule(scheduleData);
    const now = new Date();

    reminders.forEach((reminder) => {
      if (reminder.reminderTime.getTime() > now.getTime()) {
        const reminderNotification: ScheduledNotification = {
          id: `reminder-${reminder.id}`,
          config: this.createReminderNotification(reminder),
          scheduledTime: reminder.reminderTime,
          type: 'class-reminder',
          classInfo: reminder.classInfo
        };

        this.notificationManager.scheduleNotification(reminderNotification);
      }

      if (reminder.attendanceCheckTime.getTime() > now.getTime()) {
        const attendanceNotification: ScheduledNotification = {
          id: `attendance-${reminder.id}`,
          config: this.createAttendanceNotification(reminder),
          scheduledTime: reminder.attendanceCheckTime,
          type: 'attendance-check',
          classInfo: reminder.classInfo
        };

        this.notificationManager.scheduleNotification(attendanceNotification);
      }
    });

    console.log(`📅 ${reminders.length * 2}개의 알림이 예약되었습니다.`);
  }

  clearAllScheduledNotifications(): void {
    this.activeTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.activeTimers.clear();
    console.log('🗑️ 모든 예약된 알림이 취소되었습니다.');
  }

  getUpcomingNotifications(scheduleData: ScheduleData, limitHours: number = 24): ClassReminder[] {
    const reminders = this.createReminderFromSchedule(scheduleData);
    const now = new Date();
    const limitTime = new Date(now.getTime() + limitHours * 60 * 60 * 1000);

    const upcomingReminders: ClassReminder[] = [];

    reminders.forEach((reminder) => {
      // 10분 전 알림 추가
      if (reminder.reminderTime.getTime() > now.getTime() && 
          reminder.reminderTime.getTime() <= limitTime.getTime()) {
        upcomingReminders.push({
          ...reminder,
          id: `${reminder.id}-reminder`,
          classInfo: {
            ...reminder.classInfo,
            name: `🔔 ${reminder.classInfo.name} (10분전)`
          }
        });
      }

      // 정각 출석 알림 추가
      if (reminder.attendanceCheckTime.getTime() > now.getTime() && 
          reminder.attendanceCheckTime.getTime() <= limitTime.getTime()) {
        upcomingReminders.push({
          ...reminder,
          id: `${reminder.id}-attendance`,
          reminderTime: reminder.attendanceCheckTime, // 정각 시간으로 설정
          classInfo: {
            ...reminder.classInfo,
            name: `📍 ${reminder.classInfo.name} (출석확인)`
          }
        });
      }
    });

    return upcomingReminders.sort((a, b) => a.reminderTime.getTime() - b.reminderTime.getTime());
  }

  async testNotificationNow(classInfo: { name: string; room: string; professor: string }): Promise<void> {
    const testConfig: NotificationConfig = {
      title: `🧪 테스트 알림 - ${classInfo.name}`,
      body: `테스트: ${classInfo.name} 수업 알림입니다.\n교수: ${classInfo.professor}\n위치: ${classInfo.room}`,
      icon: '/icons/icon-192x192.png',
      tag: 'test-notification'
    };

    const result = await this.notificationManager.showNotification(testConfig);
    if (!result) {
      await this.notificationManager.simulateNotification(testConfig);
    }
  }

  getDeveloperInfo(): {
    totalReminders: number;
    upcomingReminders: ClassReminder[];
    notificationStatus: ReturnType<typeof import('./notifications').getNotificationStatus>;
  } {
    return {
      totalReminders: this.activeTimers.size,
      upcomingReminders: [],
      notificationStatus: this.notificationManager.getStatus()
    };
  }
}

export const notificationScheduler = NotificationScheduler.getInstance();

export const scheduleAllNotifications = (scheduleData: ScheduleData) =>
  notificationScheduler.scheduleNotifications(scheduleData);

export const getUpcomingNotifications = (scheduleData: ScheduleData, limitHours?: number) =>
  notificationScheduler.getUpcomingNotifications(scheduleData, limitHours);

export const testNotification = (classInfo: { name: string; room: string; professor: string }) =>
  notificationScheduler.testNotificationNow(classInfo);