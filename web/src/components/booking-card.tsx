'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Movie, Seat } from '@/types/booking'
import { useMemo } from 'react'
import { Countdown } from './countdown'

interface BookingCardProps {
  seat: Seat
  movie: Movie
  expiresAt: string
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
  onExpired: () => void
}

export function BookingCard({
  seat,
  movie,
  expiresAt,
  isPending,
  onConfirm,
  onCancel,
  onExpired,
}: BookingCardProps) {
  const secondsRemaining = useMemo(
    () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
    [expiresAt]
  )

  return (
    <Card className="bg-[#1e2329] border-[#2b3139]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-[#eaecef]">Booking Details</CardTitle>
          <Badge variant="outline" className="border-[#fcd535] text-[#fcd535]">
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Movie Info */}
        <div className="space-y-2">
          <p className="text-sm text-[#707a8a]">Movie</p>
          <p className="text-[#eaecef] font-medium">{movie.title}</p>
        </div>

        {/* Seat Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-[#707a8a]">Seat</p>
            <p className="text-[#fcd535] text-xl font-bold">
              {seat.row}{seat.number}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#707a8a]">Screen</p>
            <p className="text-[#eaecef]">{movie.screen}</p>
          </div>
        </div>

        {/* Show Time */}
        <div className="space-y-1">
          <p className="text-sm text-[#707a8a]">Show Time</p>
          <p className="text-[#eaecef]">{movie.showTime}</p>
        </div>

        {/* Countdown */}
        <div className="pt-2">
          <Countdown seconds={secondsRemaining} onComplete={onExpired} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onCancel}
            disabled={isPending}
            variant="outline"
            className="flex-1 bg-transparent border-[#2b3139] text-[#eaecef] hover:bg-[#3a4150] hover:text-[#eaecef]"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 bg-[#fcd535] text-[#181a20] hover:bg-[#f0b90b]"
          >
            {isPending ? 'Confirming…' : 'Confirm Booking'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
