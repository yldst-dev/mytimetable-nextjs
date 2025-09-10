'use client';

import { useEffect } from 'react';
import { notificationScheduler } from '@/lib/scheduler';
import { scheduleData } from '@/data/schedule';
import { getNotificationStatus } from '@/lib/notifications';

export default function PWAWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializePWA = async () => {
      if (process.env.NEXT_PUBLIC_PWA_ENABLED === 'true') {
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker 등록 성공:', registration);

            if (process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true') {
              // 알림 상태 확인
              const status = getNotificationStatus();
              console.log('🔔 알림 상태:', status);
              
              // 알림이 활성화되고 권한이 있을 때만 스케줄링
              if (status.canShow) {
                notificationScheduler.scheduleNotifications(scheduleData);
                console.log('📅 알림 스케줄링 완료');
                
                // 즉시 테스트 알림 발송
                setTimeout(async () => {
                  await notificationScheduler.testNotificationNow({
                    name: '테스트 수업',
                    room: '테스트 강의실',
                    professor: '테스트 교수'
                  });
                }, 3000); // 3초 후 테스트 알림
              } else {
                console.warn('⚠️ 알림을 사용할 수 없습니다:', {
                  supported: status.supported,
                  enabled: status.enabled,
                  permission: status.permission,
                  isSecure: status.isSecure
                });
                
                // 개발 환경에서는 시뮬레이션 알림 표시
                if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
                  console.log('🧪 개발 환경 - 시뮬레이션 알림 시작');
                  notificationScheduler.scheduleNotifications(scheduleData);
                }
              }
            }
          } catch (error) {
            console.error('❌ Service Worker 등록 실패:', error);
          }
        }
      }
    };

    initializePWA();
  }, []);

  return <>{children}</>;
}