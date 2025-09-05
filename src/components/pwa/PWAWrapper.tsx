'use client';

import { useEffect } from 'react';
import { notificationScheduler } from '@/lib/scheduler';
import { scheduleData } from '@/data/schedule';

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
              notificationScheduler.scheduleNotifications(scheduleData);
              console.log('📅 알림 스케줄링 완료');
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