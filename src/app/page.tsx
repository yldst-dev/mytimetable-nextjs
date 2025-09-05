import { DesktopSchedule } from "@/components/schedule/DesktopSchedule";
import { MobileSwipeSchedule } from "@/components/schedule/MobileSwipeSchedule";
import { scheduleData } from "@/data/schedule";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        <main>
          <DesktopSchedule scheduleData={scheduleData.scheduleData} />
          <MobileSwipeSchedule scheduleData={scheduleData.scheduleData} />
        </main>
      </div>
    </div>
  );
}
