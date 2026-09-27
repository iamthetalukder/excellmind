'use client';

interface WeakSubjectChartProps {
  bySubject: Record<string, number>;
  weakSubjects: string[];
}

export default function WeakSubjectChart({ bySubject, weakSubjects }: WeakSubjectChartProps) {
  const totalMinutes = Object.values(bySubject).reduce((sum, m) => sum + m, 0);
  const sortedSubjects = [...weakSubjects].sort((a, b) => (bySubject[b] || 0) - (bySubject[a] || 0));

  const colors = [
    'bg-primary-500',
    'bg-accent-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  return (
    <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-800">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Study Time by Weak Subject (30 days)</h3>

      {totalMinutes === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No study sessions logged yet. Start logging to see your breakdown.
        </p>
      ) : (
        <div className="space-y-4">
          {sortedSubjects.map((subject, i) => {
            const minutes = bySubject[subject] || 0;
            const percentage = totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0;
            const colorClass = colors[i % colors.length];

            return (
              <div key={subject}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{subject}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {(minutes / 60).toFixed(1)}h ({Math.round(percentage)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${colorClass} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Study Time (30 days)</p>
        <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
          {(totalMinutes / 60).toFixed(1)}h
        </p>
      </div>
    </div>
  );
}
