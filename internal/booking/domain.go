package booking

import "errors"

var (
	ErrSeatAlreadyBooked = errors.New("Seat is already booked")
)

// struct 用来定义一个实体的数据结构
type Booking struct {
	ID      string
	MovieID string
	SeatId  string
	UserId  string
	Status  string
}

// interface 用来定义一组行为，也就是方法规范
type BookingStore interface {
	Book(b Booking) error
	ListBookings(movieId string) []Booking
}
