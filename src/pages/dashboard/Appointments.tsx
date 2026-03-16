import { useTranslation } from 'react-i18next'

const MOCK_APPOINTMENTS = [
  { id: '1', date: '2025-03-15', time: '10:00', type: 'Consultation', status: 'upcoming' as const },
  { id: '2', date: '2025-02-20', time: '14:30', type: 'Follow-up', status: 'past' as const },
]

export function Appointments() {
  const { t } = useTranslation()
  const upcoming = MOCK_APPOINTMENTS.filter((a) => a.status === 'upcoming')
  const past = MOCK_APPOINTMENTS.filter((a) => a.status === 'past')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('appointments.title')}
      </h1>
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('appointments.upcoming')}
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">{t('appointments.empty')}</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
            {upcoming.map((apt) => (
              <li key={apt.id} className="p-4 flex flex-wrap gap-4">
                <span>{apt.date}</span>
                <span>{apt.time}</span>
                <span>{apt.type}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('appointments.past')}
        </h2>
        {past.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">{t('appointments.empty')}</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
            {past.map((apt) => (
              <li key={apt.id} className="p-4 flex flex-wrap gap-4 text-gray-600 dark:text-gray-300">
                <span>{apt.date}</span>
                <span>{apt.time}</span>
                <span>{apt.type}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
