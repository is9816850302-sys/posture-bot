import { useTranslation } from 'react-i18next'

export function Services() {
  const { t } = useTranslation()

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('services.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-12">
          {t('services.subtitle')}
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <article className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('services.careCoordination.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('services.careCoordination.description')}
            </p>
          </article>
          <article className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('services.secondOpinion.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('services.secondOpinion.description')}
            </p>
          </article>
          <article className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('services.travelHealth.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('services.travelHealth.description')}
            </p>
          </article>
        </div>
      </div>
    </div>
  )
}
