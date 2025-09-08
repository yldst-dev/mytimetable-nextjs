import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { scheduleData } from '@/data/schedule';
import { DayOfWeek } from '@/types/schedule';

export async function POST(_request: NextRequest) {
  try {
    // 기존 스케줄된 알림 삭제 (새로 생성하기 위해)
    await supabaseServer
      .from('scheduled_notifications')
      .delete()
      .eq('sent', false);

    const notifications: Array<{
      title: string;
      body: string;
      data: Record<string, unknown>;
      scheduled_for: string;
      class_period: string;
      class_name: string;
      class_room: string;
      professor: string;
      notification_type: 'class-reminder' | 'attendance-check';
    }> = [];
    const now = new Date();

    // 스케줄 데이터에서 알림 생성
    scheduleData.scheduleData.forEach((periodData) => {
      const days: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
      
      days.forEach((day) => {
        const classInfo = periodData.classes[day];
        if (!classInfo) return;

        const classStartTime = createDateFromTime(day, periodData.time);
        const reminderTime = new Date(classStartTime.getTime() - 10 * 60 * 1000); // 10분 전
        const attendanceCheckTime = new Date(classStartTime.getTime()); // 정확히 시작 시간

        // 과거 시간은 제외
        if (reminderTime.getTime() > now.getTime()) {
          // 사전 알림
          notifications.push({
            title: `🔔 수업 알림 - ${classInfo.name}`,
            body: `${periodData.time}에 ${classInfo.name} 수업이 곧 시작됩니다.\n교수: ${classInfo.professor}\n위치: ${classInfo.room}`,
            data: {
              type: 'class-reminder',
              classInfo: {
                name: classInfo.name,
                room: classInfo.room,
                professor: classInfo.professor,
                period: periodData.period,
                day: getDayKorean(day)
              }
            },
            scheduled_for: reminderTime.toISOString(),
            class_period: periodData.period,
            class_name: classInfo.name,
            class_room: classInfo.room,
            professor: classInfo.professor,
            notification_type: 'class-reminder' as const
          });
        }

        if (attendanceCheckTime.getTime() > now.getTime()) {
          // 출석 확인 알림
          notifications.push({
            title: `📍 출석 확인 - ${classInfo.name}`,
            body: `${classInfo.name} 수업이 시작되었습니다!\n출석을 확인해주세요.\n위치: ${classInfo.room}`,
            data: {
              type: 'attendance-check',
              classInfo: {
                name: classInfo.name,
                room: classInfo.room,
                professor: classInfo.professor,
                period: periodData.period,
                day: getDayKorean(day)
              }
            },
            scheduled_for: attendanceCheckTime.toISOString(),
            class_period: periodData.period,
            class_name: classInfo.name,
            class_room: classInfo.room,
            professor: classInfo.professor,
            notification_type: 'attendance-check' as const
          });
        }
      });
    });

    if (notifications.length === 0) {
      return NextResponse.json({
        message: 'No future notifications to schedule'
      });
    }

    // 데이터베이스에 스케줄된 알림 저장
    const { error } = await supabaseServer
      .from('scheduled_notifications')
      .insert(notifications)
      .select('id');

    if (error) {
      console.error('Failed to save scheduled notifications:', error);
      return NextResponse.json(
        { error: 'Failed to save scheduled notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Scheduled ${notifications.length} notifications`,
      scheduledCount: notifications.length
    });

  } catch (error) {
    console.error('Schedule notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 헬퍼 함수들
function createDateFromTime(day: DayOfWeek, timeString: string): Date {
  const now = new Date();
  const targetDate = new Date(now);
  
  const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDay = targetDate.getDay();
  const targetDay = daysOfWeek.indexOf(day);
  
  const daysUntilTarget = targetDay - currentDay;
  const adjustedDays = daysUntilTarget < 0 ? daysUntilTarget + 7 : daysUntilTarget;
  
  targetDate.setDate(targetDate.getDate() + adjustedDays);
  
  const [time] = timeString.split('~');
  const [hours, minutes] = time.split(':').map(Number);
  
  targetDate.setHours(hours, minutes, 0, 0);
  
  if (targetDate.getTime() <= now.getTime()) {
    targetDate.setDate(targetDate.getDate() + 7);
  }
  
  return targetDate;
}

function getDayKorean(day: DayOfWeek): string {
  const dayMap = {
    mon: '월요일',
    tue: '화요일',
    wed: '수요일',
    thu: '목요일',
    fri: '금요일'
  };
  return dayMap[day];
}