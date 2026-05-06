'use client'

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
          'bg-[#2b3139] text-[#eaecef] hover:bg-[#3a4150]',
          'cursor-pointer',
        ],
        isAvailable && isSelected && [
          'bg-[#fcd535] text-[#181a20]',
          'cursor-pointer ring-2 ring-[#fcd535]/50',
        ],
        isHeld && 'bg-[#707a8a] text-[#181a20] cursor-not-allowed opacity-60',
        isBooked && 'bg-[#f6465d]/20 text-[#f6465d] cursor-not-allowed'
      )}
      title={
        isBooked
          ? `Seat ${seat.id} - Booked`
          : isHeld
            ? `Seat ${seat.id} - Held by another user`
            : `Seat ${seat.id} - Available`
      }
    >
      {seat.number}
    </button>
  )
}
