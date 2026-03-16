export interface User {
  id: string
  name: string
  email: string
  phone?: string
}

export interface Appointment {
  id: string
  date: string
  time: string
  type: string
  status: 'upcoming' | 'past'
}
