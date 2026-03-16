import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Home() {
  const { t } = useTranslation()

  return (
    <div>
      <section className="bg-gradient-to-b from-primary-500/10 to-transparent dark:from-primary-600/20 dark:to-transparent py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('home.heroTitle')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/services"
              className="px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              {t('home.ctaBook')}
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg border-2 border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/30"
            >
              {t('home.ctaSignIn')}
            </Link>
          </div>
        </div>
      </section>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            {t('home.valueTitle')}
          </h2>
          <ul className="grid md:grid-cols-3 gap-6">
            <li className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              {t('home.value1')}
            </li>
            <li className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              {t('home.value2')}
            </li>
            <li className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              {t('home.value3')}
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
