interface ProgressStatsProps {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
}

export default function ProgressStats({ todayMinutes, weekMinutes, monthMinutes }: ProgressStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Study Time Today</p>
        <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">
          {(todayMinutes / 60).toFixed(1)}h
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{todayMinutes} minutes</p>
      </div>

      <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">This Week</p>
        <p className="text-4xl font-bold text-accent-600 dark:text-accent-400">
          {(weekMinutes / 60).toFixed(1)}h
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          {Math.round(weekMinutes / 60 / 7)} hours/day avg
        </p>
      </div>

      <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Last 30 Days</p>
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
          {(monthMinutes / 60).toFixed(1)}h
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          {Math.round(monthMinutes / 60 / 30)} hours/day avg
        </p>
      </div>
    </div>
  );
}
