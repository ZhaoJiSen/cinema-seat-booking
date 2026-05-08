package memory

//! memory 的 Store 实现

import (
	"cinema-seat-booking/internal/booking"
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
)

const defaultHoldTTL = 2 * time.Minute

type Store struct {
	mu       sync.RWMutex
	bookings map[string]booking.Booking
}

func NewStore() *Store {
	return &Store{bookings: make(map[string]booking.Booking)}
}

func (s *Store) Book(ctx context.Context, entry booking.Booking) (booking.Booking, error) {
	if err := ctx.Err(); err != nil {
		return booking.Booking{}, fmt.Errorf("book seat: %w", err)
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	key := seatKey(entry.MovieID, entry.SeatID)
	if _, exists := s.bookings[key]; exists {
		return booking.Booking{}, booking.ErrSeatAlreadyBooked
	}

	now := time.Now()
	entry.ID = uuid.New().String()
	entry.Status = "held"
	entry.ExpiresAt = now.Add(defaultHoldTTL)
	s.bookings[key] = entry

	return entry, nil
}

func (s *Store) ListBookings(ctx context.Context, movieID string) ([]booking.Booking, error) {
	if err := ctx.Err(); err != nil {
		return nil, fmt.Errorf("list bookings: %w", err)
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]booking.Booking, 0)
	for _, entry := range s.bookings {
		if entry.MovieID == movieID {
			result = append(result, entry)
		}
	}

	return result, nil
}

func (s *Store) ConfirmSeat(ctx context.Context, sessionID string, userID string) (booking.Booking, error) {
	if err := ctx.Err(); err != nil {
		return booking.Booking{}, fmt.Errorf("confirm seat: %w", err)
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for key, entry := range s.bookings {
		if entry.ID == sessionID {
			entry.UserID = userID
			entry.Status = "booked"
			s.bookings[key] = entry
			return entry, nil
		}
	}

	return booking.Booking{}, booking.ErrSessionNotFound
}

func (s *Store) ReleaseSeat(ctx context.Context, sessionID string) error {
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("release seat: %w", err)
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for key, entry := range s.bookings {
		if entry.ID == sessionID {
			delete(s.bookings, key)
			return nil
		}
	}

	return booking.ErrSessionNotFound
}

func seatKey(movieID string, seatID string) string {
	return movieID + ":" + seatID
}
