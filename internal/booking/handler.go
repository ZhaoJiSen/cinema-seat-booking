package booking

import (
	"cinema-seat-booking/utils"
	"encoding/json"
	"log"
	"net/http"
)

type Handler struct {
	svc Service
}

type HoldRequest struct {
	UserID string `json:"user_id"`
}

type SeatInfo struct {
	SeatID string `json:"seat_id"`
	UserID string `json:"user_id"`
	Booked bool   `json:"booked"`
}

type HoldSeatRequest struct {
	UserID string `json:"user_id"`
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: *svc}
}

func (h *Handler) ListSeats(w http.ResponseWriter, r *http.Request) {
	movieId := r.PathValue("movieID")

	bookings := h.svc.ListBookings(movieId)
	seats := make([]SeatInfo, 0, len(bookings))
	for _, b := range bookings {
		seats = append(seats, SeatInfo{
			SeatID: b.SeatID,
			UserID: b.UserID,
			Booked: true,
		})
	}

	utils.WriteJSON(w, http.StatusOK, seats)
}

func (h *Handler) HoldSeat(w http.ResponseWriter, r *http.Request) {
	movieId := r.PathValue("movieID")
	seatId := r.PathValue("seatID")

	var req HoldRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println(err)
		return
	}

	data := Booking{
		UserID:  req.UserID,
		MovieID: movieId,
		SeatID:  seatId,
	}

	session, err := h.svc.Book(data)
	if err != nil {
		log.Println(err)
		return
	}

	type HoldResponse struct {
		SessionID string `json:"session_id"`
		MovieID   string `json:"movie_id"`
		SeatID    string `json:"seat_id"`
		ExpiresAt string `json:"expires_at"`
	}

	utils.WriteJSON(w, http.StatusOK, HoldResponse{
		SessionID: session.ID,
		MovieID:   movieId,
		SeatID:    seatId,
		ExpiresAt: session.ExpiresAt.Format("2006-01-02T15:04:05Z"),
	})
}

func (h *Handler) ConfirmSession(w http.ResponseWriter, r *http.Request) {
	sessionId := r.PathValue("sessionID")

	var req HoldSeatRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return
	}

	if req.UserID == "" {
		return
	}

	session, err := h.svc.ConfirmSeat(r.Context(), sessionId, req.UserID)
	if err != nil {
		return
	}

	type SessionResponse struct {
		SessionID string `json:"session_id"`
		MovieID   string `json:"movie_id"`
		SeatID    string `json:"seat_id"`
		UserID    string `json:"user_id"`
		Status    string `json:"status"`
	}

	utils.WriteJSON(w, http.StatusOK, SessionResponse{
		SessionID: session.ID,
		MovieID:   session.MovieID,
		SeatID:    session.SeatID,
		UserID:    session.UserID,
	})
}

func (h *Handler) ReleaseSession(w http.ResponseWriter, r *http.Request) {
	sessionId := r.PathValue("sessionID")

	if err := h.svc.ReleaseSeat(r.Context(), sessionId); err != nil {
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]string{"status": "released"})
}
