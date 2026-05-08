'use client'

import { copy } from '@/lib/i18n'
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
        <div className="h-2 rounded-full bg-linear-to-r from-transparent via-primary to-transparent opacity-80" />
        <p className="mt-2 text-center text-xs uppercase tracking-widest text-muted-foreground">
          {copy.booking.screen}
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
              <span className="w-6 text-right text-sm font-medium text-muted-foreground">
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
              <span className="w-6 text-left text-sm font-medium text-muted-foreground">
                {row}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-t-sm bg-secondary" />
          <span className="text-xs text-muted-foreground">{copy.booking.available}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-t-sm bg-primary" />
          <span className="text-xs text-muted-foreground">{copy.booking.selected}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-t-sm bg-text-muted opacity-60" />
          <span className="text-xs text-muted-foreground">{copy.booking.held}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-t-sm bg-danger-soft" />
          <span className="text-xs text-muted-foreground">{copy.booking.booked}</span>
        </div>
      </div>
    </div>
  )
}
