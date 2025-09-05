import { DesktopSchedule } from "@/components/schedule/DesktopSchedule";
import { MobileSwipeSchedule } from "@/components/schedule/MobileSwipeSchedule";
import NotificationSetup from "@/components/notifications/NotificationSetup";
import { scheduleData } from "@/data/schedule";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* 알림 설정 섹션 */}
        <div className="lg:hidden">
          <NotificationSetup />
        </div>
        
        <main className="flex gap-6">
          <div className="flex-1">
            <DesktopSchedule scheduleData={scheduleData.scheduleData} />
            <MobileSwipeSchedule scheduleData={scheduleData.scheduleData} />
          </div>
          
          {/* 데스크탑에서는 사이드바에 알림 설정 */}
          <div className="hidden lg:block w-80">
            <NotificationSetup />
          </div>
        </main>
      </div>
    </div>
  );
}
