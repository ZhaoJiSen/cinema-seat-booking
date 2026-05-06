'use client'

import { useState, useCallback } from 'react'
import { Seat, Movie } from '@/types/booking'
import { movie, initialSeats } from '@/lib/mock-data'
import { SeatGrid } from '@/components/seat-grid'
import { BookingCard } from '@/components/booking-card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function BookingPage() {
  const [seats, setSeats] = useState<Seat[]>(initialSeats)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [showBookingCard, setShowBookingCard] = useState(false)
  const [alertType, setAlertType] = useState<'success' | 'taken' | null>(null)

  const handleSelectSeat = useCallback(
    (seat: Seat) => {
      setSelectedSeat(seat)
      setShowBookingCard(true)
    },
    []
  )

  const handleCancel = useCallback(() => {
    setSelectedSeat(null)
    setShowBookingCard(false)
  }, [])

  const handleExpired = useCallback(() => {
    setSelectedSeat(null)
    setShowBookingCard(false)
  }, [])

  const handleConfirm = useCallback(() => {
    if (!selectedSeat) return

    // Simulate API call - 30% chance seat is taken
    const isTaken = Math.random() < 0.3

    if (isTaken) {
      setSeats((prev) =>
        prev.map((s) =>
          s.id === selectedSeat.id
            ? { ...s, status: 'booked' as const }
            : s
        )
      )
      setAlertType('taken')
    } else {
      setSeats((prev) =>
        prev.map((s) =>
          s.id === selectedSeat.id
            ? { ...s, status: 'booked' as const }
            : s
        )
      )
      setAlertType('success')
    }

    setSelectedSeat(null)
    setShowBookingCard(false)
  }, [selectedSeat])

  return (
    <div className="min-h-screen bg-[#0b0e11]">
      {/* Header */}
      <header className="border-b border-[#2b3139]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#fcd535]">CinemaBooking</h1>
          <nav className="flex items-center gap-6">
            <span className="text-sm text-[#707a8a]">Movies</span>
            <span className="text-sm text-[#707a8a]">My Bookings</span>
            <div className="w-8 h-8 rounded-full bg-[#2b3139] flex items-center justify-center">
              <span className="text-xs text-[#eaecef]">U</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Movie Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#eaecef] mb-2">
            {movie.title}
          </h2>
          <div className="flex items-center gap-4 text-sm text-[#707a8a]">
            <span>{movie.showTime}</span>
            <span>•</span>
            <span>{movie.screen}</span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Selection */}
          <div className="lg:col-span-2">
            <div className="bg-[#1e2329] rounded-xl p-6">
              <SeatGrid
                seats={seats}
                selectedSeat={selectedSeat}
                onSelectSeat={handleSelectSeat}
              />
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-4">
            {showBookingCard && selectedSeat ? (
              <BookingCard
                seat={selectedSeat}
                movie={movie}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                onExpired={handleExpired}
              />
            ) : (
              <div className="bg-[#1e2329] rounded-xl p-6 text-center">
                <p className="text-[#707a8a]">
                  Select a seat to begin booking
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="bg-[#1e2329] rounded-xl p-6">
              <h3 className="text-sm font-medium text-[#707a8a] mb-3">
                Booking Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#707a8a]">Available</span>
                  <span className="text-[#0ecb81]">
                    {seats.filter((s) => s.status === 'available').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#707a8a]">Held</span>
                  <span className="text-[#fcd535]">
                    {seats.filter((s) => s.status === 'held').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#707a8a]">Booked</span>
                  <span className="text-[#f6465d]">
                    {seats.filter((s) => s.status === 'booked').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Alert */}
      <AlertDialog open={alertType === 'success'} onOpenChange={() => setAlertType(null)}>
        <AlertDialogContent className="bg-[#1e2329] border-[#2b3139]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0ecb81]">
              Booking Confirmed!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#707a8a]">
              Your seat has been successfully booked. Enjoy the movie!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-[#fcd535] text-[#181a20] hover:bg-[#f0b90b]">
              View My Bookings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Taken Alert */}
      <AlertDialog open={alertType === 'taken'} onOpenChange={() => setAlertType(null)}>
        <AlertDialogContent className="bg-[#1e2329] border-[#2b3139]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f6465d]">
              Seat No Longer Available
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#707a8a]">
              Unfortunately, this seat was booked by another user while you were deciding. Please select another seat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-[#2b3139] text-[#eaecef] hover:bg-[#3a4150]">
              Choose Another Seat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
