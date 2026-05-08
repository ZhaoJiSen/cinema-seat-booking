package utils

import (
	"cinema-seat-booking/internal/booking"
	"cinema-seat-booking/internal/httpx"
	"errors"
	"log"
	"net/http"
)

func WriteBookingError(w http.ResponseWriter, err error) {
	if errors.Is(err, booking.ErrSeatAlreadyBooked) {
		httpx.WriteError(w, http.StatusConflict, booking.ErrSeatAlreadyBooked.Error())
		return
	}

	if errors.Is(err, booking.ErrSessionNotFound) {
		httpx.WriteError(w, http.StatusNotFound, booking.ErrSessionNotFound.Error())
		return
	}

	log.Printf("booking handler: %v", err)
	httpx.WriteError(w, http.StatusInternalServerError, "internal server error")
}
