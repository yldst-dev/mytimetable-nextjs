'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { notificationManager, getNotificationStatus } from '@/lib/notifications';

export default function NotificationPermissionPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ReturnType<typeof getNotificationStatus> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const checkPermission = () => {
      const currentStatus = getNotificationStatus();
      setStatus(currentStatus);

      // PWA가 활성화되고 알림이 지원되는 환경에서만 프롬프트 표시
      if (currentStatus.enabled && currentStatus.supported && currentStatus.permission === 'default') {
        setIsOpen(true);
      }
      
      if (currentStatus.permission === 'denied') {
        setPermissionDenied(true);
      }
    };

    checkPermission();
    
    // 5초 후에 권한 상태 재확인 (서비스워커 준비 대기)
    const timer = setTimeout(checkPermission, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleAllowNotifications = async () => {
    setIsLoading(true);
    try {
      const permission = await notificationManager.requestPermission();
      
      if (permission === 'granted') {
        setIsOpen(false);
        // 자동으로 알림 스케줄링 시작
        try {
          const response = await fetch('/api/schedule-notifications', {
            method: 'POST'
          });
          if (response.ok) {
            console.log('✅ 알림이 자동으로 활성화되었습니다.');
          }
        } catch (error) {
          console.error('알림 스케줄링 실패:', error);
        }
      } else if (permission === 'denied') {
        setPermissionDenied(true);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDenyNotifications = () => {
    setPermissionDenied(true);
    setIsOpen(false);
  };

  // 권한 거부된 경우 경고 메시지
  if (permissionDenied && status?.enabled) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>알림 기능 비활성화</strong>
            <br />수업 알림을 받으려면 브라우저 설정에서 알림을 허용해주세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          <DialogTitle className="text-xl">수업 알림 받기</DialogTitle>
          <DialogDescription className="text-base">
            수업 시작 10분 전과 정시에 알림을 보내드려요.
            <br />놓치지 않도록 도와드릴게요! 📚
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span>🔔</span>
              <span>수업 시작 <strong>10분 전</strong> 사전 알림</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>📍</span>
              <span>수업 <strong>정시</strong> 출석 확인 알림</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>🏫</span>
              <span>강의실 위치와 교수님 정보 포함</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDenyNotifications}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              <BellOff className="w-4 h-4 mr-2" />
              나중에
            </Button>
            <Button
              onClick={handleAllowNotifications}
              className="flex-1"
              disabled={isLoading}
            >
              <Bell className="w-4 h-4 mr-2" />
              {isLoading ? '설정 중...' : '알림 허용'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            언제든지 브라우저 설정에서 변경할 수 있어요
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}