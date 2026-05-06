package booking

import (
	"testing"

	"github.com/go-redis/redis/v8"
)

func TestRedisStoreBook(t *testing.T) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "redhat",
	})

	store := newRedisStore(rdb)

	booking := Booking{
		MovieID: "movie-1",
		SeatID:  "seat-1",
		UserID:  "user-1",
	}

	err := store.Book(booking)
	if err != nil {
		t.Fatalf("Book failed: %v", err)
	}

	t.Log("Book succeeded")
}

func TestRedisStoreBookDuplicate(t *testing.T) {
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	store := newRedisStore(rdb)

	booking := Booking{
		MovieID: "movie-1",
		SeatID:  "seat-2",
		UserID:  "user-1",
	}

	// 第一次预订
	err := store.Book(booking)
	if err != nil {
		t.Fatalf("First book failed: %v", err)
	}

	// 第二次预订同一座位
	err = store.Book(booking)
	if err != ErrSeatAlreadyBooked {
		t.Fatalf("Expected ErrSeatAlreadyBooked, got: %v", err)
	}

	t.Log("Duplicate booking correctly rejected")
}
