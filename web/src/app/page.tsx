'use client'

import { BookingCard } from '@/components/booking-card'
import { SeatGrid } from '@/components/seat-grid'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { confirmSession, holdSeat, listSeats, releaseSession } from '@/lib/api'
import { generateSeats, movie } from '@/lib/mock-data'
import { Seat } from '@/types/booking'
import { useCallback, useEffect, useState } from 'react'

const USER_ID = 'user-demo'

export default function BookingPage() {
  const [seats, setSeats] = useState<Seat[]>(generateSeats())
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [showBookingCard, setShowBookingCard] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [alertType, setAlertType] = useState<'success' | 'taken' | 'error' | null>(null)
  const [isHolding, setIsHolding] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  // Load current seat statuses from backend on mount
  useEffect(() => {
    listSeats(movie.id)
      .then((bookedSeats) => {
        setSeats((prev) =>
          prev.map((seat) => {
            const hit = bookedSeats.find((s) => s.seat_id === seat.id)
            return hit ? { ...seat, status: 'booked' as const } : seat
          })
        )
      })
      .catch(console.error)
  }, [])

  const handleSelectSeat = useCallback(
    async (seat: Seat) => {
      if (isHolding) return
      setIsHolding(true)
      try {
        const result = await holdSeat(movie.id, seat.id, USER_ID)
        setSeats((prev) =>
          prev.map((s) =>
            s.id === seat.id ? { ...s, status: 'held' as const } : s
          )
        )
        setSelectedSeat(seat)
        setSessionId(result.session_id)
        setExpiresAt(result.expires_at)
        setShowBookingCard(true)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : ''
        if (message.includes('already booked')) {
          setSeats((prev) =>
            prev.map((s) =>
              s.id === seat.id ? { ...s, status: 'booked' as const } : s
            )
          )
          setAlertType('taken')
        } else {
          setAlertType('error')
        }
      } finally {
        setIsHolding(false)
      }
    },
    [isHolding]
  )

  const resetBookingState = useCallback((seatStatus: 'available' | 'booked') => {
    setSelectedSeat((prev) => {
      if (prev) {
        setSeats((s) =>
          s.map((seat) =>
            seat.id === prev.id ? { ...seat, status: seatStatus } : seat
          )
        )
      }
      return null
    })
    setSessionId(null)
    setExpiresAt(null)
    setShowBookingCard(false)
  }, [])

  const handleCancel = useCallback(async () => {
    if (sessionId) {
      await releaseSession(sessionId).catch(console.error)
    }
    resetBookingState('available')
  }, [sessionId, resetBookingState])

  const handleExpired = useCallback(async () => {
    if (sessionId) {
      await releaseSession(sessionId).catch(console.error)
    }
    resetBookingState('available')
  }, [sessionId, resetBookingState])

  const handleConfirm = useCallback(async () => {
    if (!selectedSeat || !sessionId) return
    setIsConfirming(true)
    try {
      await confirmSession(sessionId, USER_ID)
      resetBookingState('booked')
      setAlertType('success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('already booked')) {
        resetBookingState('booked')
        setAlertType('taken')
      } else {
        resetBookingState('available')
        setAlertType('error')
      }
    } finally {
      setIsConfirming(false)
    }
  }, [selectedSeat, sessionId, resetBookingState])

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
            <div className={`bg-[#1e2329] rounded-xl p-6 transition-opacity ${isHolding ? 'opacity-60 pointer-events-none' : ''}`}>
              <SeatGrid
                seats={seats}
                selectedSeat={selectedSeat}
                onSelectSeat={handleSelectSeat}
              />
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-4">
            {showBookingCard && selectedSeat && expiresAt ? (
              <BookingCard
                seat={selectedSeat}
                movie={movie}
                expiresAt={expiresAt}
                isPending={isConfirming}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                onExpired={handleExpired}
              />
            ) : (
              <div className="bg-[#1e2329] rounded-xl p-6 text-center">
                <p className="text-[#707a8a]">
                  {isHolding ? 'Reserving seat…' : 'Select a seat to begin booking'}
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

      {/* Generic Error Alert */}
      <AlertDialog open={alertType === 'error'} onOpenChange={() => setAlertType(null)}>
        <AlertDialogContent className="bg-[#1e2329] border-[#2b3139]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f6465d]">
              Something Went Wrong
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#707a8a]">
              Unable to connect to the booking service. Please ensure the backend is running and try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-[#2b3139] text-[#eaecef] hover:bg-[#3a4150]">
              Dismiss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
