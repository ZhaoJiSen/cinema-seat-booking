'use client'

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
    if (progress > 0.5) return 'text-[#0ecb81]'
    if (progress > 0.25) return 'text-[#fcd535]'
    return 'text-[#f6465d]'
  }

  const getBgColor = () => {
    if (progress > 0.5) return 'bg-[#0ecb81]'
    if (progress > 0.25) return 'bg-[#fcd535]'
    return 'bg-[#f6465d]'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`text-2xl font-bold font-mono ${getColor()}`}>
        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="w-full h-1.5 bg-[#2b3139] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${getBgColor()}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="text-xs text-[#707a8a]">
        {timeLeft > 0 ? 'Time remaining to complete booking' : 'Time expired'}
      </p>
    </div>
  )
}
