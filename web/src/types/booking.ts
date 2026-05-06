export interface Seat {
  id: string
  row: string
  number: number
  status: 'available' | 'held' | 'booked'
  heldBy?: string
  expiresAt?: string
}

export interface Booking {
  id: string
  movieId: string
  seatId: string
  userId: string
  status: 'held' | 'booked'
  expiresAt: string
}

export interface Movie {
  id: string
  title: string
  showTime: string
  screen: string
}
