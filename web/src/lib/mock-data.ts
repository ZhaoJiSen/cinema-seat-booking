import { Seat, Movie } from '@/types/booking'

export const movie: Movie = {
  id: 'movie-1',
  title: 'Interstellar: IMAX Experience',
  showTime: '2026-05-06 19:30',
  screen: 'IMAX Hall 1',
}

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const seatsPerRow = 12

// Simple seeded random number generator
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function generateSeats(): Seat[] {
  const seats: Seat[] = []
  const random = seededRandom(42)

  for (const row of rows) {
    for (let num = 1; num <= seatsPerRow; num++) {
      const id = `${row}${num}`
      const isBooked = random() < 0.2
      const isHeld = !isBooked && random() < 0.1

      seats.push({
        id,
        row,
        number: num,
        status: isBooked ? 'booked' : isHeld ? 'held' : 'available',
        heldBy: isHeld ? `user-${Math.floor(random() * 100)}` : undefined,
        expiresAt: isHeld
          ? new Date(Date.now() + Math.floor(random() * 120000)).toISOString()
          : undefined,
      })
    }
  }

  return seats
}

export const initialSeats = generateSeats()
