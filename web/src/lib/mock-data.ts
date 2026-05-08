import { Movie, Seat } from '@/types/booking'

export const movie: Movie = {
  id: 'interstellar',
  title: 'Interstellar: IMAX Experience',
  showTime: '2026-05-06 19:30',
  screen: 'IMAX Hall 1',
}

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const seatsPerRow = 12

export function generateSeats(): Seat[] {
  const seats: Seat[] = []
  for (const row of rows) {
    for (let num = 1; num <= seatsPerRow; num++) {
      seats.push({
        id: `${row}${num}`,
        row,
        number: num,
        status: 'available',
      })
    }
  }
  return seats
}

export const initialSeats = generateSeats()
