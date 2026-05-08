package bookinghttp

import "net/http"

func RegisterRoutes(mux *http.ServeMux, handler *Handler) {
	mux.HandleFunc("GET /movies/{movieID}/seats", handler.ListSeats)
	mux.HandleFunc("GET /movies/{movieID}/seats/{seatID}/hold", handler.HoldSeat)
	mux.HandleFunc("PUT /sessions/{sessionID}/confirm", handler.ConfirmSession)
	mux.HandleFunc("DELETE /sessions/{sessionID}", handler.ReleaseSession)
}
