"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TimeSlot, DAYS, DayOfWeek, PROFESSOR_COLORS } from "@/types/schedule";
import { cn } from "@/lib/utils";

interface MobileScheduleProps {
  scheduleData: TimeSlot[];
}

export function MobileSchedule({ scheduleData }: MobileScheduleProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const currentDay = DAYS[currentDayIndex];

  const handlePreviousDay = () => {
    setCurrentDayIndex((prev) => (prev > 0 ? prev - 1 : DAYS.length - 1));
  };

  const handleNextDay = () => {
    setCurrentDayIndex((prev) => (prev < DAYS.length - 1 ? prev + 1 : 0));
  };

  const getCurrentDaySchedule = (day: DayOfWeek) => {
    return scheduleData.filter(timeSlot => timeSlot.classes[day] !== null);
  };

  return (
    <div className="lg:hidden w-full">
      <Tabs value={currentDay.key} className="w-full">
        {/* 헤더: 현재 요일 표시 및 네비게이션 */}
        <div className="flex items-center justify-between mb-4 px-1">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handlePreviousDay}
            aria-label="이전 요일"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold">{currentDay.label}</h2>
            <p className="text-sm text-muted-foreground">
              {getCurrentDaySchedule(currentDay.key).length}개 수업
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleNextDay}
            aria-label="다음 요일"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 요일 선택 탭 */}
        <TabsList className="grid w-full grid-cols-5 mb-4">
          {DAYS.map((day, index) => (
            <TabsTrigger 
              key={day.key} 
              value={day.key}
              onClick={() => setCurrentDayIndex(index)}
              className="text-xs"
            >
              {day.label.charAt(0)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 각 요일별 시간표 컨텐츠 */}
        {DAYS.map((day) => (
          <TabsContent key={day.key} value={day.key} className="space-y-0 mt-0">
            {scheduleData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                시간표 데이터가 없습니다.
              </div>
            ) : (
              <div className="bg-white rounded-lg border overflow-hidden">
                {scheduleData.map((timeSlot) => {
                  const classInfo = timeSlot.classes[day.key];
                  if (!classInfo) {
                    return (
                      <div key={`${day.key}-${timeSlot.period}`} className="border-b border-gray-100 p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-24 flex-shrink-0 text-sm text-gray-500 bg-gray-50 rounded p-2">
                            <div className="font-medium text-center">{timeSlot.period}</div>
                            <div className="text-xs text-center mt-1">{timeSlot.time}</div>
                          </div>
                          <div className="flex-1 text-sm text-gray-400 italic pl-2">
                            빈 시간
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  const professorColor = PROFESSOR_COLORS[classInfo.professor] || PROFESSOR_COLORS.none;
                  
                  return (
                    <div key={`${day.key}-${timeSlot.period}`} className="border-b border-gray-100 last:border-b-0 p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-24 flex-shrink-0 bg-gray-50 rounded p-2">
                          <div className="text-sm font-medium text-center text-gray-700">{timeSlot.period}</div>
                          <div className="text-xs text-center text-gray-600 mt-1">{timeSlot.time}</div>
                        </div>
                        <div className={cn("flex-1 p-3 rounded text-white", professorColor)}>
                          <div className="space-y-1">
                            <div className="font-medium text-sm leading-tight">
                              {classInfo.name}
                            </div>
                            <div className="text-xs opacity-90 leading-tight">
                              📍 {classInfo.room}
                            </div>
                            <div className="text-xs opacity-90">
                              👤 {classInfo.professor}
                            </div>
                            {classInfo.code && (
                              <div className="text-xs opacity-75">
                                🔖 {classInfo.code}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}