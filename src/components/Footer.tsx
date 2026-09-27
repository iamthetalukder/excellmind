export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-dark-900 border-t border-gray-200 dark:border-dark-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">© {currentYear} ExcelMind. All rights reserved.</p>
          <p>
            Developed by{' '}
            <a
              href="https://frictionlabai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold"
            >
              FrictionLab
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
