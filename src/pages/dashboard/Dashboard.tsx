import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'

export function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {t('dashboard.welcome')}, {user?.name ?? 'User'}!
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        {t('dashboard.overview')}
      </p>
      <section className="mb-8 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('dashboard.nextAppointment')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {t('dashboard.noAppointments')}
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('dashboard.quickLinks')}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/dashboard/profile"
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            {t('nav.profile')}
          </Link>
          <Link
            to="/dashboard/appointments"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('nav.appointments')}
          </Link>
          <Link
            to="/dashboard/settings"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('nav.settings')}
          </Link>
        </div>
      </section>
    </div>
  )
}
