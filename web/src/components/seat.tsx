'use client'

import { copy } from '@/lib/i18n'
import { Seat as SeatType } from '@/types/booking'
import { cn } from '@/lib/utils'

interface SeatProps {
  seat: SeatType
  isSelected: boolean
  onSelect: (seat: SeatType) => void
}

export function Seat({ seat, isSelected, onSelect }: SeatProps) {
  const isAvailable = seat.status === 'available'
  const isHeld = seat.status === 'held'
  const isBooked = seat.status === 'booked'

  return (
    <button
      onClick={() => isAvailable && onSelect(seat)}
      disabled={!isAvailable}
      className={cn(
        'w-8 h-8 rounded-t-md text-xs font-medium transition-all duration-200',
        'flex items-center justify-center',
        'focus:outline-none',
        isAvailable && !isSelected && [
          'bg-secondary text-foreground hover:bg-accent',
          'cursor-pointer',
        ],
        isAvailable && isSelected && [
          'bg-primary text-primary-foreground',
          'cursor-pointer ring-2 ring-ring',
        ],
        isHeld && 'bg-text-muted text-primary-foreground cursor-not-allowed opacity-60',
        isBooked && 'bg-danger-soft text-danger cursor-not-allowed'
      )}
      title={
        isBooked
          ? `${copy.booking.seatLabel} ${seat.id} - ${copy.seatStatus.booked}`
          : isHeld
            ? `${copy.booking.seatLabel} ${seat.id} - ${copy.seatStatus.held}`
            : `${copy.booking.seatLabel} ${seat.id} - ${copy.seatStatus.available}`
      }
    >
      {seat.number}
    </button>
  )
}
