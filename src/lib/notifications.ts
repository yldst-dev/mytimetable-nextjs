// 알림 관리 유틸리티

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export interface ScheduledNotification {
  id: string;
  config: NotificationConfig;
  scheduledTime: Date;
  type: 'class-reminder' | 'attendance-check';
  classInfo: {
    name: string;
    room: string;
    professor: string;
    period: string;
    day: string;
  };
}

export class NotificationManager {
  private static instance: NotificationManager;
  private isSupported: boolean = false;
  private isEnabled: boolean = false;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkSupport();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private checkSupport() {
    if (typeof window === 'undefined') return;
    
    this.isSupported = 'Notification' in window;
    this.isEnabled = this.getNotificationSetting();
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  private getNotificationSetting(): boolean {
    // 환경변수 체크
    const envEnabled = process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true';
    const isSecure = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost');
    
    return envEnabled && isSecure && this.isSupported;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported || !this.isEnabled) {
      return 'denied';
    }

    try {
      this.permission = await Notification.requestPermission();
      
      if (this.permission === 'granted') {
        await this.subscribeToPush();
      }
      
      return this.permission;
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return 'denied';
    }
  }

  async subscribeToPush(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // VAPID 공개 키 가져오기
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return false;
      }

      // 기존 구독 확인
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // 새 구독 생성
        const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource
        });
      }

      // 서버에 구독 정보 저장
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
          },
          userAgent: navigator.userAgent
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Push subscription saved:', result.subscriptionId);
        return true;
      } else {
        console.error('Failed to save push subscription:', result.error);
        return false;
      }

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // 서버에서 구독 제거
        await fetch('/api/push-subscription', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        });

        // 브라우저에서 구독 제거
        await subscription.unsubscribe();
        console.log('Push subscription removed');
      }

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async showNotification(config: NotificationConfig): Promise<boolean> {
    if (!this.canShowNotifications()) {
      console.log('알림을 표시할 수 없습니다:', {
        supported: this.isSupported,
        enabled: this.isEnabled,
        permission: this.permission
      });
      return false;
    }

    try {
      // 서비스워커 등록 확인
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(config.title, {
          body: config.body,
          icon: config.icon || '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: config.tag,
          requireInteraction: config.requireInteraction || false,
          data: {
            timestamp: Date.now(),
            url: '/'
          }
        });
      } else {
        // 일반 알림 (fallback)
        new Notification(config.title, {
          body: config.body,
          icon: config.icon || '/icons/icon-192x192.png',
          tag: config.tag
        });
      }
      
      return true;
    } catch (error) {
      console.error('알림 표시 실패:', error);
      return false;
    }
  }

  scheduleNotification(notification: ScheduledNotification): void {
    const now = new Date();
    const delay = notification.scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      console.log('예정된 시간이 이미 지났습니다:', notification);
      return;
    }

    console.log(`알림 예약됨: ${notification.config.title} (${delay}ms 후)`);

    setTimeout(async () => {
      await this.showNotification(notification.config);
    }, delay);
  }

  canShowNotifications(): boolean {
    return this.isSupported && this.isEnabled && this.permission === 'granted';
  }

  getStatus() {
    return {
      supported: this.isSupported,
      enabled: this.isEnabled,
      permission: this.permission,
      canShow: this.canShowNotifications(),
      envSetting: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS,
      isSecure: typeof window !== 'undefined' && window.isSecureContext
    };
  }

  // 개발 모드용 시뮬레이션 알림
  simulateNotification(config: NotificationConfig): Promise<boolean> {
    console.log('🔔 [시뮬레이션] 알림:', config);
    
    if (typeof window !== 'undefined') {
      // 브라우저 콘솔에 알림 표시
      const notification = {
        ...config,
        timestamp: new Date().toISOString(),
        simulated: true
      };
      
      console.table(notification);
      
      // 개발 도구에서 알림 이벤트 발생
      window.dispatchEvent(new CustomEvent('dev-notification', {
        detail: notification
      }));
    }
    
    return Promise.resolve(true);
  }
}

// 편의 함수들
export const notificationManager = NotificationManager.getInstance();

export const requestNotificationPermission = () => 
  notificationManager.requestPermission();

export const showNotification = (config: NotificationConfig) => 
  notificationManager.showNotification(config);

export const getNotificationStatus = () => 
  notificationManager.getStatus();