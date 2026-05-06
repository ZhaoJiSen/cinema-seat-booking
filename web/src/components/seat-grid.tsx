'use client'

import { Fragment } from 'react'
import { Seat as SeatType } from '@/types/booking'
import { Seat } from './seat'

interface SeatGridProps {
  seats: SeatType[]
  selectedSeat: SeatType | null
  onSelectSeat: (seat: SeatType) => void
}

export function SeatGrid({ seats, selectedSeat, onSelectSeat }: SeatGridProps) {
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort()

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="relative">
        <div className="h-2 bg-gradient-to-r from-transparent via-[#fcd535] to-transparent rounded-full opacity-80" />
        <p className="text-center text-xs text-[#707a8a] mt-2 uppercase tracking-widest">
          Screen
        </p>
      </div>

      {/* Seats */}
      <div className="space-y-2">
        {rows.map((row) => {
          const rowSeats = seats
            .filter((s) => s.row === row)
            .sort((a, b) => a.number - b.number)

          return (
            <div key={row} className="flex items-center gap-2">
              <span className="w-6 text-right text-sm text-[#707a8a] font-medium">
                {row}
              </span>
              <div className="flex gap-1.5 flex-1 justify-center">
                {rowSeats.map((seat, index) => (
                  <Fragment key={seat.id}>
                    <Seat
                      seat={seat}
                      isSelected={selectedSeat?.id === seat.id}
                      onSelect={onSelectSeat}
                    />
                    {index === 5 && <div className="w-4" />}
                  </Fragment>
                ))}
              </div>
              <span className="w-6 text-left text-sm text-[#707a8a] font-medium">
                {row}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-t-sm bg-[#2b3139]" />
          <span className="text-xs text-[#707a8a]">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-t-sm bg-[#fcd535]" />
          <span className="text-xs text-[#707a8a]">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-t-sm bg-[#707a8a] opacity-60" />
          <span className="text-xs text-[#707a8a]">Held</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-t-sm bg-[#f6465d]/20" />
          <span className="text-xs text-[#707a8a]">Booked</span>
        </div>
      </div>
    </div>
  )
}
