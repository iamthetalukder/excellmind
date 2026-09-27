export interface RoutineSlot {
  subject: string;
  startTime: string;
  endTime: string;
  type: 'weak' | 'strong' | 'break';
  durationMinutes: number;
}

export interface DailyRoutine {
  date: string;
  dayOfWeek: string;
  slots: RoutineSlot[];
  totalStudyMinutes: number;
  weakSubjectMinutes: number;
  strongSubjectMinutes: number;
}

export interface GeneratedRoutine {
  studentId: string;
  batchId: string;
  examDate: string;
  daysUntilExam: number;
  totalAvailableHours: number;
  routine: DailyRoutine[];
  summary: {
    weeklyWeakFocus: number; // percentage
    weeklystrongFocus: number;
    avgDailyHours: number;
  };
}

export function generateRoutine(
  availableHoursPerDay: number,
  weakSubjects: string[],
  examDate: Date
): GeneratedRoutine {
  // Validation
  if (availableHoursPerDay <= 0) {
    throw new Error('Available hours must be greater than 0');
  }
  if (weakSubjects.length === 0) {
    throw new Error('At least one weak subject must be selected');
  }

  const allSubjects = [
    'Bengali',
    'English',
    'Math',
    'Higher Math',
    'Physics',
    'Chemistry',
    'Biology',
    'Social Science',
    'Islamic Studies',
  ];

  const strongSubjects = allSubjects.filter(
    (s) => !weakSubjects.includes(s)
  );

  if (strongSubjects.length === 0) {
    // If all 9 are weak, treat first 4 as strong
    strongSubjects.push(...weakSubjects.slice(0, 4));
  }

  const weakPercent = 0.6;
  const strongPercent = 0.4;
  const breakPercent = 0.05; // 5% breaks

  const weakMinutesPerDay = availableHoursPerDay * 60 * weakPercent;
  const strongMinutesPerDay = availableHoursPerDay * 60 * strongPercent;
  const breakMinutesPerDay = availableHoursPerDay * 60 * breakPercent;

  const now = new Date();
  const daysUntilExam = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const routine: DailyRoutine[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const slots: RoutineSlot[] = [];
    const date = new Date(now);
    date.setDate(date.getDate() + dayIndex);
    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];

    let currentTime = 6 * 60; // 6 AM in minutes
    let weakTimeUsed = 0;
    let strongTimeUsed = 0;
    let breakTimeUsed = 0;

    // Distribute weak subjects across the day
    const dayWeakSubjects = weakSubjects.filter((_, i) => i % 7 === dayIndex);
    for (const subject of dayWeakSubjects) {
      const slotDuration = Math.min(90, weakMinutesPerDay - weakTimeUsed); // 90 min slots for weak
      if (slotDuration > 15) {
        const startTime = timeToString(currentTime);
        const endTime = timeToString(currentTime + slotDuration);
        slots.push({
          subject,
          startTime,
          endTime,
          type: 'weak',
          durationMinutes: slotDuration,
        });
        currentTime += slotDuration;
        weakTimeUsed += slotDuration;

        // Add break after slot if more time remains
        if (weakTimeUsed < weakMinutesPerDay && breakTimeUsed < breakMinutesPerDay) {
          const breakDuration = Math.min(15, breakMinutesPerDay - breakTimeUsed);
          slots.push({
            subject: 'Break',
            startTime: timeToString(currentTime),
            endTime: timeToString(currentTime + breakDuration),
            type: 'break',
            durationMinutes: breakDuration,
          });
          currentTime += breakDuration;
          breakTimeUsed += breakDuration;
        }
      }
    }

    // Distribute strong subjects
    const dayStrongSubjects = strongSubjects.filter((_, i) => {
      const strongCount = strongSubjects.length;
      return strongCount > 0 ? i % strongCount === dayIndex % strongCount : false;
    });

    for (const subject of dayStrongSubjects) {
      const slotDuration = Math.min(60, strongMinutesPerDay - strongTimeUsed); // 60 min slots for strong
      if (slotDuration > 15) {
        const startTime = timeToString(currentTime);
        const endTime = timeToString(currentTime + slotDuration);
        slots.push({
          subject,
          startTime,
          endTime,
          type: 'strong',
          durationMinutes: slotDuration,
        });
        currentTime += slotDuration;
        strongTimeUsed += slotDuration;

        // Add break
        if (strongTimeUsed < strongMinutesPerDay && breakTimeUsed < breakMinutesPerDay) {
          const breakDuration = Math.min(15, breakMinutesPerDay - breakTimeUsed);
          slots.push({
            subject: 'Break',
            startTime: timeToString(currentTime),
            endTime: timeToString(currentTime + breakDuration),
            type: 'break',
            durationMinutes: breakDuration,
          });
          currentTime += breakDuration;
          breakTimeUsed += breakDuration;
        }
      }
    }

    // Cap at 10 PM (22:00)
    const maxTime = 22 * 60;
    if (currentTime > maxTime) {
      slots.forEach((slot) => {
        if (timeToMinutes(slot.endTime) > maxTime) {
          const overflow = timeToMinutes(slot.endTime) - maxTime;
          slot.endTime = timeToString(maxTime);
          slot.durationMinutes -= overflow;
        }
      });
    }

    const totalStudyMinutes = slots
      .filter((s) => s.type !== 'break')
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    const weakMinutes = slots
      .filter((s) => s.type === 'weak')
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    const strongMinutes = slots
      .filter((s) => s.type === 'strong')
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    routine.push({
      date: dateString,
      dayOfWeek,
      slots,
      totalStudyMinutes,
      weakSubjectMinutes: weakMinutes,
      strongSubjectMinutes: strongMinutes,
    });
  }

  const totalWeakMinutes = routine.reduce((sum, day) => sum + day.weakSubjectMinutes, 0);
  const totalStrongMinutes = routine.reduce((sum, day) => sum + day.strongSubjectMinutes, 0);
  const totalMinutes = totalWeakMinutes + totalStrongMinutes;

  return {
    studentId: '',
    batchId: '',
    examDate: examDate.toISOString().split('T')[0],
    daysUntilExam,
    totalAvailableHours: availableHoursPerDay * 7,
    routine,
    summary: {
      weeklyWeakFocus: totalMinutes > 0 ? Math.round((totalWeakMinutes / totalMinutes) * 100) : 0,
      weeklystrongFocus: totalMinutes > 0 ? Math.round((totalStrongMinutes / totalMinutes) * 100) : 0,
      avgDailyHours: totalMinutes / (7 * 60),
    },
  };
}

function timeToString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function timeToMinutes(timeString: string): number {
  const [hours, mins] = timeString.split(':').map(Number);
  return hours * 60 + mins;
}
