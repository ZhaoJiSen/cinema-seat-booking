package bookinghttp

import (
	"cinema-seat-booking/internal/booking"
	"cinema-seat-booking/internal/httpx"
	"cinema-seat-booking/utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type BookingService interface {
	Book(ctx context.Context, entry booking.Booking) (booking.Booking, error)
	ListBookings(ctx context.Context, movieID string) ([]booking.Booking, error)
	ConfirmSeat(ctx context.Context, sessionID string, userID string) (booking.Booking, error)
	ReleaseSeat(ctx context.Context, sessionID string) error
}

type Handler struct {
	svc BookingService
}

func NewHandler(svc BookingService) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) ListSeats(w http.ResponseWriter, r *http.Request) {
	movieID := r.PathValue("movieID")

	bookings, err := h.svc.ListBookings(r.Context(), movieID)
	if err != nil {
		utils.WriteBookingError(w, fmt.Errorf("list seats for %s: %w", movieID, err))
		return
	}

	seats := make([]seatInfo, 0, len(bookings))
	for _, entry := range bookings {
		seats = append(seats, seatInfo{
			SeatID: entry.SeatID,
			UserID: entry.UserID,
			Booked: true,
		})
	}

	httpx.WriteJSON(w, http.StatusOK, seats)
}

func (h *Handler) HoldSeat(w http.ResponseWriter, r *http.Request) {
	movieID := r.PathValue("movieID")
	seatID := r.PathValue("seatID")

	var req holdRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.UserID == "" {
		httpx.WriteError(w, http.StatusBadRequest, "user_id is required")
		return
	}

	session, err := h.svc.Book(r.Context(), booking.Booking{
		UserID:  req.UserID,
		MovieID: movieID,
		SeatID:  seatID,
	})
	if err != nil {
		utils.WriteBookingError(w, fmt.Errorf("hold seat %s for movie %s: %w", seatID, movieID, err))
		return
	}

	httpx.WriteJSON(w, http.StatusOK, holdResponse{
		SessionID: session.ID,
		MovieID:   movieID,
		SeatID:    seatID,
		ExpiresAt: session.ExpiresAt.Format(time.RFC3339),
	})
}

func (h *Handler) ConfirmSession(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("sessionID")

	var req sessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.UserID == "" {
		httpx.WriteError(w, http.StatusBadRequest, "user_id is required")
		return
	}

	session, err := h.svc.ConfirmSeat(r.Context(), sessionID, req.UserID)
	if err != nil {
		utils.WriteBookingError(w, fmt.Errorf("confirm session %s: %w", sessionID, err))
		return
	}

	httpx.WriteJSON(w, http.StatusOK, sessionResponse{
		SessionID: session.ID,
		MovieID:   session.MovieID,
		SeatID:    session.SeatID,
		UserID:    session.UserID,
		Status:    session.Status,
	})
}

func (h *Handler) ReleaseSession(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("sessionID")

	if err := h.svc.ReleaseSeat(r.Context(), sessionID); err != nil {
		utils.WriteBookingError(w, fmt.Errorf("release session %s: %w", sessionID, err))
		return
	}

	httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "released"})
}
