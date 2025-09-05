import { Class, PROFESSOR_COLORS } from "@/types/schedule";
import { cn } from "@/lib/utils";

interface ScheduleCardProps {
  classInfo: Class | null;
  period?: string;
  time?: string;
  className?: string;
}

export function ScheduleCard({ classInfo, period, time, className }: ScheduleCardProps) {
  if (!classInfo) {
    return (
      <div 
        className={cn("h-20 sm:h-24 bg-gray-50/30", className)}
        role="cell"
        aria-label={period && time ? `${period} ${time} - 빈 시간` : "빈 시간"}
      >
        <div className="p-1 sm:p-2 h-full flex items-center justify-center">
          <div className="text-xs sm:text-sm text-gray-400 text-center">
            빈 시간
          </div>
        </div>
      </div>
    );
  }

  const professorColor = PROFESSOR_COLORS[classInfo.professor] || PROFESSOR_COLORS.none;

  return (
    <div 
      className={cn("h-20 sm:h-24", professorColor, className)}
      role="cell"
      aria-label={`${classInfo.name}, ${classInfo.room}, ${classInfo.professor}${classInfo.code ? `, ${classInfo.code}` : ''}`}
    >
      <div className="p-1 sm:p-2 h-full flex flex-col justify-center text-white">
        <div className="space-y-1 sm:space-y-2">
          <div className="font-medium text-xs sm:text-sm leading-tight line-clamp-2">
            {classInfo.name}
          </div>
          
          {/* 모바일 뷰 - 간단한 교수명만 */}
          <div className="text-xs opacity-90 sm:hidden">
            {classInfo.professor}
          </div>
          
          {/* 데스크탑 뷰 - 배지 형태 */}
          <div className="hidden sm:block">
            <div className="flex flex-col gap-1">
              {classInfo.name.includes('채플') ? (
                <div className="flex gap-1">
                  <span className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs">
                    {classInfo.room}
                  </span>
                  {classInfo.code && (
                    <span className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs">
                      {classInfo.code}
                    </span>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs self-start">
                  {classInfo.room}
                </span>
              )}
              <span className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs self-start">
                {classInfo.professor}
              </span>
              {!classInfo.name.includes('채플') && classInfo.code && (
                <span className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs self-start">
                  {classInfo.code}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}