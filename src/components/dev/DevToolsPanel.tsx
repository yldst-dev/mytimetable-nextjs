'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Activity } from "lucide-react";
import { notificationManager, getNotificationStatus } from '@/lib/notifications';
import { notificationScheduler, getUpcomingNotifications, testNotification } from '@/lib/scheduler';
import { scheduleData } from '@/data/schedule';
import NotificationSetup from '@/components/notifications/NotificationSetup';

export default function DevToolsPanel() {
  const [notificationStatus, setNotificationStatus] = useState<ReturnType<typeof getNotificationStatus> | null>(null);
  const [upcomingNotifications, setUpcomingNotifications] = useState<ReturnType<typeof getUpcomingNotifications>>([]);
  const [isOpen, setIsOpen] = useState(false);

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

  const handleScheduleAll = async () => {
    try {
      // 서버에 알림 스케줄링 요청
      const response = await fetch('/api/schedule-notifications', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${result.scheduledCount}개의 알림이 데이터베이스에 스케줄되었습니다.`);
        // 로컬 스케줄러도 실행 (개발 모드용)
        notificationScheduler.scheduleNotifications(scheduleData);
        setUpcomingNotifications(getUpcomingNotifications(scheduleData, 48));
      } else {
        console.error('알림 스케줄링 실패:', result.error);
      }
    } catch (error) {
      console.error('알림 스케줄링 요청 실패:', error);
      // 폴백: 로컬 스케줄링
      notificationScheduler.scheduleNotifications(scheduleData);
      setUpcomingNotifications(getUpcomingNotifications(scheduleData, 48));
    }
  };

  const handleTestNotification = async () => {
    console.log('🧪 테스트 알림 발송 시작...');
    try {
      await testNotification({
        name: '테스트 수업',
        room: '테스트 강의실',
        professor: '테스트 교수'
      });
      console.log('✅ 테스트 알림 발송 완료');
    } catch (error) {
      console.error('❌ 테스트 알림 발송 실패:', error);
    }
  };

  const handleTestImmediateNotification = async () => {
    console.log('🚀 즉시 알림 테스트...');
    const status = getNotificationStatus();
    console.log('알림 상태:', status);
    
    if (!status.canShow) {
      alert('알림을 표시할 수 없습니다. 브라우저 설정을 확인해주세요.');
      return;
    }

    try {
      const result = await notificationManager.showNotification({
        title: '🧪 즉시 테스트 알림',
        body: '이 알림이 보인다면 설정이 정상입니다!',
        icon: '/icons/icon-192x192.png',
        tag: 'immediate-test'
      });
      
      if (result) {
        console.log('✅ 즉시 알림 성공');
      } else {
        console.log('⚠️ 알림 실패 - 시뮬레이션 모드로 전환');
        await notificationManager.simulateNotification({
          title: '🧪 시뮬레이션 테스트 알림',
          body: '시뮬레이션 모드에서 실행 중입니다.',
          icon: '/icons/icon-192x192.png',
          tag: 'simulation-test'
        });
      }
    } catch (error) {
      console.error('❌ 즉시 알림 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert('알림 발송 실패: ' + errorMessage);
    }
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

  // 프로덕션 환경에서는 개발 도구 숨김
  if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
    return null;
  }

  // PWA 모드에서 알림이 활성화된 경우에도 숨김
  if (process.env.NEXT_PUBLIC_PWA_ENABLED === 'true' && 
      process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true' &&
      typeof window !== 'undefined' && window.isSecureContext) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm border shadow-lg hover:bg-gray-50"
        >
          <Settings className="w-4 h-4 mr-2" />
          개발 도구
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            PWA 개발 도구
            <Badge variant="secondary" className="text-xs">DEV</Badge>
          </DialogTitle>
          <DialogDescription>
            알림 시스템 관리 및 PWA 기능 테스트
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              알림 설정
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              디버깅
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              시스템 상태
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 max-h-[50vh] overflow-y-auto">
            <TabsContent value="notifications" className="space-y-4">
              <NotificationSetup />
            </TabsContent>

            <TabsContent value="debug" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">제어 패널</CardTitle>
                  <CardDescription>
                    알림 시스템 테스트 및 관리
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleRequestPermission} 
                      variant="outline"
                      disabled={!notificationStatus?.supported}
                      className="h-auto p-4 flex-col"
                    >
                      <Bell className="w-5 h-5 mb-2" />
                      알림 권한 요청
                    </Button>
                    <Button 
                      onClick={handleTestImmediateNotification} 
                      variant="default"
                      className="h-auto p-4 flex-col bg-green-600 hover:bg-green-700"
                    >
                      🚀
                      즉시 알림 테스트
                    </Button>
                    <Button 
                      onClick={handleScheduleAll} 
                      variant="outline"
                      className="h-auto p-4 flex-col"
                    >
                      📅
                      모든 알림 예약
                    </Button>
                    <Button 
                      onClick={handleTestNotification} 
                      variant="outline"
                      className="h-auto p-4 flex-col"
                    >
                      🧪
                      테스트 알림
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      onClick={handleClearAll} 
                      variant="destructive"
                      className="h-auto p-4 flex-col"
                    >
                      🗑️
                      모든 알림 취소
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      ⏰ 예정된 알림 ({upcomingNotifications.length}개)
                    </h4>
                    {upcomingNotifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        예정된 알림이 없습니다.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {upcomingNotifications.slice(0, 6).map((notification, index) => (
                          <div key={index} className="p-3 bg-muted rounded-lg">
                            <div className="font-medium text-sm">
                              {notification.classInfo.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateTime(notification.reminderTime)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {notification.classInfo.room} · {notification.classInfo.professor}
                            </div>
                          </div>
                        ))}
                        {upcomingNotifications.length > 6 && (
                          <div className="text-xs text-center text-muted-foreground py-2">
                            ... 외 {upcomingNotifications.length - 6}개 더
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">시스템 상태</CardTitle>
                  <CardDescription>
                    PWA 및 알림 시스템 상태 정보
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notificationStatus && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">브라우저 지원</span>
                          <Badge variant={notificationStatus.supported ? 'default' : 'destructive'}>
                            {notificationStatus.supported ? '지원됨' : '미지원'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">환경 설정</span>
                          <Badge variant={notificationStatus.enabled ? 'default' : 'secondary'}>
                            {notificationStatus.enabled ? '활성화' : '비활성화'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">권한 상태</span>
                          <Badge variant={getStatusBadgeVariant(notificationStatus.permission)}>
                            {notificationStatus.permission}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">HTTPS 상태</span>
                          <Badge variant={notificationStatus.isSecure ? 'default' : 'destructive'}>
                            {notificationStatus.isSecure ? '보안됨' : '비보안'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">환경 변수</h4>
                    <div className="text-sm space-y-1 text-muted-foreground bg-muted p-3 rounded-lg font-mono">
                      <div>NODE_ENV: {process.env.NODE_ENV}</div>
                      <div>NEXT_PUBLIC_ENABLE_NOTIFICATIONS: {process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS}</div>
                      <div>NEXT_PUBLIC_PWA_ENABLED: {process.env.NEXT_PUBLIC_PWA_ENABLED}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}