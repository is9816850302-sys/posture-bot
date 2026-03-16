import { useTranslation } from 'react-i18next'

export function About() {
  const { t } = useTranslation()

  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('about.title')}
        </h1>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('about.mission')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('about.missionText')}
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('about.team')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('about.teamText')}
          </p>
        </section>
      </div>
    </div>
  )
}
