'use client';

import { useState } from 'react';

interface RoutineSlot {
  subject: string;
  startTime: string;
  endTime: string;
  type: 'weak' | 'strong' | 'break';
  durationMinutes: number;
}

interface DayRoutine {
  date: string;
  dayOfWeek: string;
  slots: RoutineSlot[];
  totalStudyMinutes: number;
  weakSubjectMinutes: number;
  strongSubjectMinutes: number;
}

interface RoutineCardProps {
  day: DayRoutine;
}

export default function RoutineCard({ day }: RoutineCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl overflow-hidden"
    >
      <summary className="cursor-pointer p-6 hover:bg-gray-50 dark:hover:bg-dark-800 transition font-semibold text-gray-900 dark:text-white flex justify-between items-center">
        <div>
          <span className="text-lg">{day.dayOfWeek}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">{day.date}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
            {(day.totalStudyMinutes / 60).toFixed(1)}h study
          </div>
          <div className="text-xs font-normal text-gray-500 dark:text-gray-500">
            Weak: {(day.weakSubjectMinutes / 60).toFixed(1)}h | Strong: {(day.strongSubjectMinutes / 60).toFixed(1)}h
          </div>
        </div>
      </summary>

      {isOpen && (
        <div className="border-t border-gray-200 dark:border-dark-800 p-6 bg-gray-50 dark:bg-dark-800 space-y-3">
          {day.slots.map((slot, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                slot.type === 'weak'
                  ? 'bg-primary-100 dark:bg-primary-900 border border-primary-300 dark:border-primary-700'
                  : slot.type === 'strong'
                  ? 'bg-accent-100 dark:bg-accent-900 border border-accent-300 dark:border-accent-700'
                  : 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold ${
                  slot.type === 'weak'
                    ? 'text-primary-700 dark:text-primary-300'
                    : slot.type === 'strong'
                    ? 'text-accent-700 dark:text-accent-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {slot.subject}
                </span>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-900 px-2 py-1 rounded">
                  {slot.durationMinutes}m
                </span>
              </div>
              <div className={`text-sm ${
                slot.type === 'weak'
                  ? 'text-primary-600 dark:text-primary-400'
                  : slot.type === 'strong'
                  ? 'text-accent-600 dark:text-accent-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {slot.startTime} — {slot.endTime}
              </div>
            </div>
          ))}
        </div>
      )}
    </details>
  );
}
