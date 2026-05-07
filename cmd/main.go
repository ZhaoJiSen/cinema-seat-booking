package main

import (
	"cinema-seat-booking/internal/adapters/redis"
	"cinema-seat-booking/internal/booking"
	"cinema-seat-booking/utils"
	"log"
	"net/http"
)

func main() {
	// ServeMux 是 Go 官方自带的轻量路由器
	mux := http.NewServeMux()
	mux.HandleFunc("GET /movies", listMovies)

	store := booking.NewRedisStore(redis.NewClient("localhost:6379"))
	svc := booking.NewService(store)

	bookHandler := booking.NewHandler(svc)

	mux.HandleFunc("GET /movies/{movieID}/seats", bookHandler.ListSeats)
	mux.HandleFunc("GET /movies/{movieID}/seats/{seatID}/hold", bookHandler.HoldSeat)
	mux.HandleFunc("PUT /sessions/{sessionID}/confirm", bookHandler.ConfirmSession)
	mux.HandleFunc("DELETE /sessions/{sessionID}", bookHandler.ReleaseSession)

	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}

type movieResponse struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Rows        int    `json:"rows"`
	SeatsPerRow int    `json:"seats_per_row"`
}

var movies = []movieResponse{
	{ID: "inception", Title: "Inception", Rows: 5, SeatsPerRow: 10},
	{ID: "interstellar", Title: "Interstellar", Rows: 5, SeatsPerRow: 10},
}

// t 是客户端请求的数据
// w 是你返回给客户端的数据
func listMovies(w http.ResponseWriter, t *http.Request) {
	utils.WriteJSON(w, http.StatusOK, movies)
}
