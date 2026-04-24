package booking

type MemoryStore struct {
	bookings map[string]Booking
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		bookings: make(map[string]Booking),
	}
}

func (s *MemoryStore) Book(b Booking) error {
	if _, exists := s.bookings[b.SeatId]; exists {

	}

}

func (s *MemoryStore) ListBookings(movieId string) []Booking {

}
