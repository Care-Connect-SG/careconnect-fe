"use client";

import React, { useState } from 'react';
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfMonth,
  startOfToday,
  addMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useActivity } from '@/context/activity-context';
import { ActivityDialog } from './activity-dialog';
import { Activity } from '@/types/activity';

export default function CalendarTable() {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const { activities, setFilters } = useActivity();

  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());
  const days = eachDayOfInterval({
    start: startOfMonth(firstDayCurrentMonth),
    end: endOfMonth(firstDayCurrentMonth),
  });

  function previousMonth() {
    const firstDayNextMonth = parse(currentMonth, 'MMM-yyyy', new Date());
    setCurrentMonth(format(addMonths(firstDayNextMonth, -1), 'MMM-yyyy'));
  }

  function nextMonth() {
    const firstDayNextMonth = parse(currentMonth, 'MMM-yyyy', new Date());
    setCurrentMonth(format(addMonths(firstDayNextMonth, 1), 'MMM-yyyy'));
  }

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setFilters({
      start_date: format(day, 'yyyy-MM-dd'),
      end_date: format(day, 'yyyy-MM-dd'),
    });
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsActivityDialogOpen(true);
  };

  const getDayActivities = (day: Date) => {
    return activities.filter((activity) =>
      isSameDay(parseISO(activity.start_time), day)
    );
  };

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl text-gray-900">
          {format(firstDayCurrentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 mt-4 text-sm leading-6 text-center text-gray-500">
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </div>
      <div className="grid grid-cols-7 mt-2 text-sm">
        {days.map((day, dayIdx) => {
          const dayActivities = getDayActivities(day);
          return (
            <div
              key={day.toString()}
              className={cn(
                'relative py-1.5 focus-within:z-10',
                dayIdx === 0 && colStartClasses[getDay(day)]
              )}
            >
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                className={cn(
                  'mx-auto flex h-8 w-8 items-center justify-center rounded-full',
                  isEqual(day, selectedDay) && 'text-white',
                  !isEqual(day, selectedDay) &&
                    isToday(day) &&
                    'text-red-500',
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    isSameMonth(day, firstDayCurrentMonth) &&
                    'text-gray-900',
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    'text-gray-400',
                  isEqual(day, selectedDay) &&
                    isToday(day) &&
                    'bg-red-500',
                  isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    'bg-gray-900',
                  !isEqual(day, selectedDay) && 'hover:bg-gray-200',
                  (isEqual(day, selectedDay) || isToday(day)) &&
                    'font-semibold'
                )}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')}>
                  {format(day, 'd')}
                </time>
              </button>
              <div className="px-1 mt-1">
                {dayActivities.slice(0, 2).map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleActivityClick(activity)}
                    className="w-full text-left mb-1 px-1 py-0.5 text-xs rounded bg-blue-100 text-blue-700 truncate hover:bg-blue-200"
                  >
                    {activity.title}
                  </button>
                ))}
                {dayActivities.length > 2 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{dayActivities.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ActivityDialog
        isOpen={isActivityDialogOpen}
        onClose={() => {
          setIsActivityDialogOpen(false);
          setSelectedActivity(null);
        }}
        activity={selectedActivity}
        defaultDate={selectedDay}
      />
    </div>
  );
}

const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];
