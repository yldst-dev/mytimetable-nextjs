import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScheduleCard } from "./ScheduleCard";
import { TimeSlot, DAYS } from "@/types/schedule";
import { cn } from "@/lib/utils";

interface DesktopScheduleProps {
  scheduleData: TimeSlot[];
}

export function DesktopSchedule({ scheduleData }: DesktopScheduleProps) {
  return (
    <div className="hidden sm:block w-full overflow-x-auto">
      <div className="rounded-lg border bg-white overflow-hidden min-w-[800px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b-2">
              <TableHead className="w-16 sm:w-20 text-center font-semibold py-2 sm:py-3 text-xs sm:text-sm">
                시간
              </TableHead>
              {DAYS.map((day) => (
                <TableHead key={day.key} className="text-center font-semibold min-w-32 sm:min-w-48 py-2 sm:py-3 text-xs sm:text-sm">
                  <span className="hidden sm:inline">{day.label}</span>
                  <span className="sm:hidden">{day.label.charAt(0)}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduleData.map((timeSlot) => (
              <TableRow key={timeSlot.period} className="border-0">
                <TableCell className="text-center font-medium bg-gray-50/50 border-r border-gray-200 p-0 align-top border-b border-gray-100">
                  <div className="p-2 sm:p-3 h-20 sm:h-24 flex flex-col justify-center">
                    <div className="font-semibold text-xs sm:text-sm">{timeSlot.period}</div>
                    <div className="text-xs text-gray-600 mt-1 hidden sm:block">{timeSlot.time}</div>
                  </div>
                </TableCell>
                {DAYS.map((day, dayIndex) => (
                  <TableCell 
                    key={day.key} 
                    className={cn(
                      "p-0 border-b border-gray-100",
                      dayIndex < DAYS.length - 1 && "border-r border-gray-100"
                    )}
                  >
                    <ScheduleCard 
                      classInfo={timeSlot.classes[day.key]} 
                      className="w-full rounded-none border-0 h-20 sm:h-24"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}