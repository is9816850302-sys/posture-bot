import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => i18n.changeLanguage('en')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition ${
          i18n.language === 'en'
            ? 'bg-primary-600 text-white dark:bg-primary-500'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage('ar')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition ${
          i18n.language === 'ar'
            ? 'bg-primary-600 text-white dark:bg-primary-500'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        عربي
      </button>
    </div>
  )
}
