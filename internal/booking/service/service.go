package service

import (
	"cinema-seat-booking/internal/booking"
	"context"
)

//! Service 层用于将上层的传输层 handler.go 和下层的存储抽象层 store.go 连接起来
//! Service 层在定义业务入口，Service 把这些业务动作暴露出来，给 handler 调用

type Service struct {
	store booking.Store
}

func New(store booking.Store) *Service {
	return &Service{store: store}
}

func (s *Service) Book(ctx context.Context, entry booking.Booking) (booking.Booking, error) {
	return s.store.Book(ctx, entry)
}

func (s *Service) ListBookings(ctx context.Context, movieID string) ([]booking.Booking, error) {
	return s.store.ListBookings(ctx, movieID)
}

func (s *Service) ConfirmSeat(ctx context.Context, sessionID string, userID string) (booking.Booking, error) {
	return s.store.ConfirmSeat(ctx, sessionID, userID)
}

func (s *Service) ReleaseSeat(ctx context.Context, sessionID string) error {
	return s.store.ReleaseSeat(ctx, sessionID)
}
