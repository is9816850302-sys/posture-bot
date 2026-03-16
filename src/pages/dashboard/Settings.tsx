import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Settings() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('settings.title')}
      </h1>
      <div className="space-y-6 max-w-md">
        <section className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('settings.language')}
          </h2>
          <LanguageSwitcher />
        </section>
        <section className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('settings.notifications')}
          </h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-gray-700 dark:text-gray-300">{t('settings.notificationsLabel')}</span>
          </label>
        </section>
        <section className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('settings.password')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Password change can be implemented when connecting to a backend.
          </p>
        </section>
      </div>
    </div>
  )
}
