package booking

import "errors"

var (
	ErrSeatAlreadyBooked = errors.New("seat already booked")
	ErrSessionNotFound = errors.New("session not found")
)
