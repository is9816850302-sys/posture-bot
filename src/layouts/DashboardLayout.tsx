import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'

export function DashboardLayout() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <aside className="w-56 bg-white dark:bg-gray-800 border-e border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/dashboard" className="text-lg font-semibold text-gray-900 dark:text-white">
            Health Concierge
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('nav.dashboard')}
          </Link>
          <Link
            to="/dashboard/profile"
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('nav.profile')}
          </Link>
          <Link
            to="/dashboard/appointments"
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('nav.appointments')}
          </Link>
          <Link
            to="/dashboard/settings"
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('nav.settings')}
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-start text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('nav.logout')}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
