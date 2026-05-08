'use client';

import { copy } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Movie, Seat } from '@/types/booking';
import { useEffect, useState } from 'react';
import { Countdown } from './countdown';

interface BookingCardProps {
  seat: Seat;
  movie: Movie;
  expiresAt: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onExpired: () => void;
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
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );

      setSecondsRemaining(remaining);
    };

    updateRemaining();

    const timer = setInterval(updateRemaining, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <Card className='border-border bg-card'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg text-foreground'>
            {copy.booking.detailsTitle}
          </CardTitle>
          <Badge variant='outline' className='border-primary text-primary'>
            {copy.booking.pending}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Movie Info */}
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>{copy.booking.movieLabel}</p>
          <p className='font-medium text-foreground'>{movie.title}</p>
        </div>

        {/* Seat Info */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1'>
            <p className='text-sm text-muted-foreground'>{copy.booking.seatLabel}</p>
            <p className='text-xl font-bold text-primary'>
              {seat.row}
              {seat.number}
            </p>
          </div>
          <div className='space-y-1'>
            <p className='text-sm text-muted-foreground'>{copy.booking.screenLabel}</p>
            <p className='text-foreground'>{movie.screen}</p>
          </div>
        </div>

        {/* Show Time */}
        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground'>{copy.booking.showTimeLabel}</p>
          <p className='text-foreground'>{movie.showTime}</p>
        </div>

        {/* Countdown */}
        <div className='pt-2'>
          <Countdown seconds={secondsRemaining} onComplete={onExpired} />
        </div>

        {/* Actions */}
        <div className='flex gap-3 pt-2'>
          <Button
            onClick={onCancel}
            disabled={isPending}
            variant='outline'
            className='flex-1 border-border bg-transparent text-foreground hover:bg-accent hover:text-foreground'
          >
            {copy.booking.cancel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className='flex-1 bg-primary text-primary-foreground hover:bg-warning-strong'
          >
            {isPending ? copy.booking.confirming : copy.booking.confirm}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
