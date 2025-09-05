'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, BellOff, CheckCircle, AlertCircle, Info } from "lucide-react";
import { notificationManager, getNotificationStatus } from '@/lib/notifications';
import { notificationScheduler } from '@/lib/scheduler';
import { scheduleData } from '@/data/schedule';

export default function NotificationSetup() {
  const [status, setStatus] = useState<ReturnType<typeof getNotificationStatus> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getNotificationStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      await notificationManager.requestPermission();
      setStatus(getNotificationStatus());
      
      if (status?.canShow) {
        notificationScheduler.scheduleNotifications(scheduleData);
      }
    } catch (error) {
      console.error('권한 요청 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      const testConfig = {
        title: '🔔 알림 테스트',
        body: '알림이 정상적으로 작동합니다!',
        icon: '/icons/icon-192x192.png'
      };
      
      const result = await notificationManager.showNotification(testConfig);
      if (!result) {
        await notificationManager.simulateNotification(testConfig);
      }
    } catch (error) {
      console.error('테스트 알림 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!status) {
    return null;
  }

  const getPermissionStatus = () => {
    if (!status.supported) {
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        text: '브라우저가 알림을 지원하지 않습니다',
        variant: 'destructive' as const
      };
    }

    if (!status.enabled) {
      return {
        icon: Info,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        text: '개발 환경에서는 알림이 비활성화되어 있습니다',
        variant: 'secondary' as const
      };
    }

    if (status.permission === 'granted') {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        text: '알림 권한이 허용되었습니다',
        variant: 'default' as const
      };
    }

    if (status.permission === 'denied') {
      return {
        icon: BellOff,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        text: '알림 권한이 거부되었습니다',
        variant: 'destructive' as const
      };
    }

    return {
      icon: Bell,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      text: '알림 권한을 요청해주세요',
      variant: 'secondary' as const
    };
  };

  const permissionInfo = getPermissionStatus();
  const Icon = permissionInfo.icon;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          수업 알림 설정
        </CardTitle>
        <CardDescription>
          수업 10분 전과 정시에 알림을 받아보세요
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 현재 상태 */}
        <Alert className={permissionInfo.bgColor}>
          <Icon className={`h-4 w-4 ${permissionInfo.color}`} />
          <AlertDescription className="flex items-center justify-between">
            <span>{permissionInfo.text}</span>
            <Badge variant={permissionInfo.variant} className="ml-2">
              {status.permission}
            </Badge>
          </AlertDescription>
        </Alert>

        {/* 환경 정보 */}
        {!status.enabled && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              HTTPS 환경에서만 알림 기능이 활성화됩니다. 
              현재는 개발 모드용 시뮬레이션을 사용합니다.
            </AlertDescription>
          </Alert>
        )}

        {/* 액션 버튼들 */}
        <div className="space-y-2">
          {status.permission !== 'granted' && status.supported && status.enabled && (
            <Button 
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '요청 중...' : '알림 권한 허용하기'}
            </Button>
          )}

          {status.canShow && (
            <Button 
              onClick={handleTestNotification}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? '전송 중...' : '테스트 알림 보내기'}
            </Button>
          )}

          {!status.canShow && status.enabled && (
            <Button 
              onClick={handleTestNotification}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? '시뮬레이션 중...' : '알림 시뮬레이션 테스트'}
            </Button>
          )}
        </div>

        {/* 상세 정보 */}
        <div className="text-sm space-y-2 pt-4 border-t">
          <div className="font-medium">알림 기능:</div>
          <ul className="space-y-1 text-muted-foreground ml-4">
            <li>• 수업 시작 10분 전 사전 알림</li>
            <li>• 수업 정시 출석 확인 알림</li>
            <li>• 수업명, 교수명, 강의실 정보 포함</li>
            <li>• 주말에는 알림이 발생하지 않습니다</li>
          </ul>
        </div>

        {/* 디버그 정보 (개발 모드에서만) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">디버그 정보</summary>
            <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto">
              {JSON.stringify(status, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}