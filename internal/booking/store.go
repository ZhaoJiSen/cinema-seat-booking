package booking

import "context"

// interface 用来定义一组行为，也就是方法规范
// ! 顶层的接口定义，只用于规定 要提供哪些能力
type Store interface {
	Book(ctx context.Context, booking Booking) (Booking, error)
	ListBookings(ctx context.Context, movieID string) ([]Booking, error)
	ConfirmSeat(ctx context.Context, sessionID string, userID string) (Booking, error)
	ReleaseSeat(ctx context.Context, sessionID string) error
}
