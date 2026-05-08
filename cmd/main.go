package main

import (
	"cinema-seat-booking/internal/adapters/redis"
	bookingservice "cinema-seat-booking/internal/booking/service"
	bookinghttp "cinema-seat-booking/internal/booking/transport/http"
	"cinema-seat-booking/internal/httpx"
	"context"
	"log"
	"net/http"
)

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

func main() {
	// ServeMux 是 Go 官方自带的轻量路由器
	mux := http.NewServeMux()
	mux.HandleFunc("GET /movies", listMovies)

	rdb, err := redis.NewClient(context.Background(), "localhost:6379")
	if err != nil {
		log.Fatal(err)
	}

	store := redis.NewStore(rdb)
	svc := bookingservice.New(store)
	bookHandler := bookinghttp.NewHandler(svc)

	bookinghttp.RegisterRoutes(mux, bookHandler)

	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}

// t 是客户端请求的数据
// w 是你返回给客户端的数据
func listMovies(w http.ResponseWriter, t *http.Request) {
	httpx.WriteJSON(w, http.StatusOK, movies)
}
