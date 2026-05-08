'use client'

import { copy } from '@/lib/i18n'
import { useEffect, useState } from 'react'

interface CountdownProps {
  seconds: number
  onComplete: () => void
}

export function Countdown({ seconds, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onComplete])

  const minutes = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const progress = timeLeft / seconds

  const getColor = () => {
    if (progress > 0.5) return 'text-success'
    if (progress > 0.25) return 'text-warning'
    return 'text-danger'
  }

  const getBgColor = () => {
    if (progress > 0.5) return 'bg-success'
    if (progress > 0.25) return 'bg-warning'
    return 'bg-danger'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`text-2xl font-bold font-mono ${getColor()}`}>
        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all duration-1000 ${getBgColor()}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {timeLeft > 0 ? copy.booking.countdownActive : copy.booking.countdownExpired}
      </p>
    </div>
  )
}
