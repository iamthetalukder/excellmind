import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'ExcelMind - SSC/HSC Exam Preparation',
  description: 'AI-powered study routines for Bangladesh SSC and HSC exams',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo-mark.png"
            alt="ExcelMind"
            width={120}
            height={120}
            className="w-24 h-24"
          />
        </div>

        <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
          ExcelMind
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-2">
          Think. Learn. Excel.
        </p>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
          AI-powered study routines for SSC and HSC exam success
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/auth/student/signup"
            className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
          >
            Start as Student
          </Link>
          <Link
            href="/auth/instructor/signup"
            className="px-8 py-3 border-2 border-teal-600 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition font-semibold"
          >
            Join as Teacher
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Personalized Routines
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              7-day study schedules tailored to your weak subjects
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Track Progress
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Log study sessions and watch your progress toward exam day
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Stay Focused
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              60% focus on weak subjects, 40% review of strong ones
            </p>
          </div>
        </div>
      </section>

      {/* Exam Info */}
      <section className="bg-white dark:bg-slate-800 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Ready for SSC 2028?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Exam date: March 1, 2028 — Start your routine today.
          </p>
          <Link
            href="/auth/student/signup"
            className="inline-block px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
