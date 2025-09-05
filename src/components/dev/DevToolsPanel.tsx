'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notificationManager, getNotificationStatus } from '@/lib/notifications';
import { notificationScheduler, getUpcomingNotifications, testNotification } from '@/lib/scheduler';
import { scheduleData } from '@/data/schedule';

export default function DevToolsPanel() {
  const [notificationStatus, setNotificationStatus] = useState<ReturnType<typeof getNotificationStatus> | null>(null);
  const [upcomingNotifications, setUpcomingNotifications] = useState<ReturnType<typeof getUpcomingNotifications>>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setNotificationStatus(getNotificationStatus());
      setUpcomingNotifications(getUpcomingNotifications(scheduleData, 48));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRequestPermission = async () => {
    await notificationManager.requestPermission();
    setNotificationStatus(getNotificationStatus());
  };

  const handleScheduleAll = () => {
    notificationScheduler.scheduleNotifications(scheduleData);
    setUpcomingNotifications(getUpcomingNotifications(scheduleData, 48));
  };

  const handleTestNotification = async () => {
    await testNotification({
      name: '테스트 수업',
      room: '테스트 강의실',
      professor: '테스트 교수'
    });
  };

  const handleClearAll = () => {
    notificationScheduler.clearAllScheduledNotifications();
    setUpcomingNotifications([]);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short'
    }).format(date);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'granted': return 'default';
      case 'denied': return 'destructive';
      default: return 'secondary';
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      >
        🛠️ 개발 도구 {isVisible ? '숨기기' : '보기'}
      </Button>

      {isVisible && (
        <Card className="w-96 max-h-[70vh] overflow-y-auto bg-white/95 backdrop-blur-sm border shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              🔧 PWA 개발 도구
              <Badge variant="secondary" className="text-xs">DEV</Badge>
            </CardTitle>
            <CardDescription>
              알림 시스템 디버깅 및 테스트 도구
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 알림 상태 */}
            <div>
              <h4 className="font-medium mb-2">🔔 알림 시스템 상태</h4>
              {notificationStatus && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>브라우저 지원:</span>
                    <Badge variant={notificationStatus.supported ? 'default' : 'destructive'}>
                      {notificationStatus.supported ? '지원됨' : '미지원'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>환경 설정:</span>
                    <Badge variant={notificationStatus.enabled ? 'default' : 'secondary'}>
                      {notificationStatus.enabled ? '활성화' : '비활성화'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>권한 상태:</span>
                    <Badge variant={getStatusBadgeVariant(notificationStatus.permission)}>
                      {notificationStatus.permission}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>HTTPS 상태:</span>
                    <Badge variant={notificationStatus.isSecure ? 'default' : 'destructive'}>
                      {notificationStatus.isSecure ? '보안됨' : '비보안'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* 컨트롤 버튼들 */}
            <div className="space-y-2">
              <h4 className="font-medium">🎮 제어 패널</h4>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  onClick={handleRequestPermission} 
                  size="sm" 
                  variant="outline"
                  disabled={!notificationStatus?.supported}
                >
                  🔐 알림 권한 요청
                </Button>
                <Button 
                  onClick={handleScheduleAll} 
                  size="sm" 
                  variant="outline"
                >
                  📅 모든 알림 예약
                </Button>
                <Button 
                  onClick={handleTestNotification} 
                  size="sm" 
                  variant="outline"
                >
                  🧪 테스트 알림 보내기
                </Button>
                <Button 
                  onClick={handleClearAll} 
                  size="sm" 
                  variant="destructive"
                >
                  🗑️ 모든 알림 취소
                </Button>
              </div>
            </div>

            <Separator />

            {/* 예정된 알림들 */}
            <div>
              <h4 className="font-medium mb-2">
                ⏰ 예정된 알림 ({upcomingNotifications.length}개)
              </h4>
              {upcomingNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  예정된 알림이 없습니다.
                </p>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {upcomingNotifications.slice(0, 5).map((notification, index) => (
                    <div key={index} className="text-xs p-2 bg-gray-50 rounded border">
                      <div className="font-medium text-blue-700">
                        {notification.classInfo.name}
                      </div>
                      <div className="text-gray-600">
                        {formatDateTime(notification.reminderTime)}
                      </div>
                      <div className="text-gray-500">
                        {notification.classInfo.room} · {notification.classInfo.professor}
                      </div>
                    </div>
                  ))}
                  {upcomingNotifications.length > 5 && (
                    <div className="text-xs text-center text-muted-foreground">
                      ... 외 {upcomingNotifications.length - 5}개 더
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* 환경 정보 */}
            <div className="text-xs space-y-1 text-muted-foreground">
              <div>환경: {process.env.NODE_ENV}</div>
              <div>알림 활성화: {process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS}</div>
              <div>PWA 활성화: {process.env.NEXT_PUBLIC_PWA_ENABLED}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}