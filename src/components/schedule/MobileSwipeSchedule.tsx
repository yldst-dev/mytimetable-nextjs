"use client";

import { useState, useRef } from "react";
import { TimeSlot, DAYS, DayOfWeek, PROFESSOR_COLORS } from "@/types/schedule";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileSwipeScheduleProps {
  scheduleData: TimeSlot[];
}

export function MobileSwipeSchedule({ scheduleData }: MobileSwipeScheduleProps) {
  // 현재 요일을 기반으로 초기 인덱스 설정
  const getCurrentDayIndex = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    
    // 월~금요일은 해당 요일 인덱스 반환 (월요일=1 -> 0, 화요일=2 -> 1, ...)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      return dayOfWeek - 1;
    }
    // 주말(토요일, 일요일)은 월요일(0) 반환
    return 0;
  };

  const [currentDayIndex, setCurrentDayIndex] = useState(getCurrentDayIndex());
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDay = DAYS[currentDayIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);
    
    // 가로 스와이프가 세로 스크롤보다 명확할 때만 스와이프로 인식
    if (deltaX > deltaY && deltaX > 15) {
      setIsSwiping(true);
      e.preventDefault(); // 스크롤 방지
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX) {
      setTouchStartX(null);
      setTouchStartY(null);
      setIsSwiping(false);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touchStartX - touch.clientX;
    const deltaY = touchStartY ? Math.abs(touch.clientY - touchStartY) : 0;
    const minSwipeDistance = 30;

    console.log('Touch end:', { deltaX, deltaY, isSwiping }); // 디버깅용

    // 가로 움직임이 세로 움직임보다 크고, 최소 스와이프 거리를 만족할 때
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // 왼쪽으로 스와이프 = 다음 요일
        if (currentDayIndex < DAYS.length - 1) {
          setCurrentDayIndex(prev => prev + 1);
        }
      } else {
        // 오른쪽으로 스와이프 = 이전 요일
        if (currentDayIndex > 0) {
          setCurrentDayIndex(prev => prev - 1);
        }
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
    setIsSwiping(false);
  };

  const handlePreviousDay = () => {
    setCurrentDayIndex(prev => (prev > 0 ? prev - 1 : DAYS.length - 1));
  };

  const handleNextDay = () => {
    setCurrentDayIndex(prev => (prev < DAYS.length - 1 ? prev + 1 : 0));
  };

  const getDaySchedule = (day: DayOfWeek) => {
    return scheduleData.filter(timeSlot => timeSlot.classes[day] !== null).length;
  };

  return (
    <div className="sm:hidden w-full">
      {/* 헤더 네비게이션 */}
      <div className="flex items-center justify-between mb-4 px-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handlePreviousDay}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold">{currentDay.label}</h2>
          <p className="text-xs text-gray-600">
            {getDaySchedule(currentDay.key)}개 수업
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleNextDay}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 요일 인디케이터 */}
      <div className="flex justify-center space-x-2 mb-4">
        {DAYS.map((day, index) => (
          <button
            key={day.key}
            onClick={() => setCurrentDayIndex(index)}
            className={cn(
              "w-8 h-8 rounded-full text-xs font-medium transition-colors",
              currentDayIndex === index
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            )}
          >
            {day.label.charAt(0)}
          </button>
        ))}
      </div>

      {/* 스와이프 가능한 테이블 컨테이너 */}
      <div
        ref={containerRef}
        className="overflow-hidden relative touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: isSwiping ? 'none' : 'pan-y' }}
      >
        <div className="bg-white rounded-lg border overflow-hidden">
          {/* 테이블 바디 */}
          <div>
            {scheduleData.map((timeSlot) => {
              const classInfo = timeSlot.classes[currentDay.key];
              const professorColor = classInfo 
                ? PROFESSOR_COLORS[classInfo.professor] || PROFESSOR_COLORS.none
                : '';

              return (
                <div key={timeSlot.period} className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-stretch">
                    <div className="w-24 bg-gray-50/50 border-r border-gray-100 p-3 flex flex-col justify-center flex-shrink-0">
                      <div className="text-xs font-medium text-center text-gray-700">{timeSlot.period}</div>
                      <div className="text-xs text-gray-600 text-center mt-1">{timeSlot.time}</div>
                    </div>
                    
                    <div className={cn(
                      "flex-1 p-4 min-h-[70px] flex flex-col justify-center",
                      classInfo ? `${professorColor} text-white` : "bg-gray-50/30"
                    )}>
                      {classInfo ? (
                        <div className="space-y-2">
                          <div className="font-medium text-sm leading-tight">
                            {classInfo.name}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {classInfo.name.includes('채플') ? (
                              <div className="flex gap-1.5">
                                <span className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                                  {classInfo.room}
                                </span>
                                {classInfo.code && (
                                  <span className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                                    {classInfo.code}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs self-start">
                                {classInfo.room}
                              </span>
                            )}
                            <span className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs self-start">
                              {classInfo.professor}
                            </span>
                            {!classInfo.name.includes('채플') && classInfo.code && (
                              <span className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs self-start">
                                {classInfo.code}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 text-center italic">
                          빈 시간
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 스와이프 힌트 */}
      <div className="text-center mt-3 text-xs text-gray-500">
        ← 좌우로 스와이프하여 다른 요일 보기 →
      </div>
    </div>
  );
}