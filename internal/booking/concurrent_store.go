package booking

import (
	"context"
	"sync"
)

type ConcurrentStore struct {
	booking map[string]Booking

	// 添加一个读写锁来保护 booking map 的并发访问
	sync.RWMutex
}

func NewConcurrentStore() *ConcurrentStore {
	return &ConcurrentStore{
		booking: map[string]Booking{},
	}
}

func (s *ConcurrentStore) Book(b Booking) error {
	// 在访问 booking map 之前，先获取写锁，确保在同一时间只有一个 goroutine 可以修改 booking map
	s.Lock()
	defer s.Unlock()

	if _, exists := s.booking[b.SeatID]; exists {
		return ErrSeatAlreadyBooked
	}

	s.booking[b.SeatID] = b
	return nil
}

func (s *ConcurrentStore) ListBookings(movieId string) []Booking {
	// 读取锁
	s.RLock()
	defer s.RUnlock()

	var result []Booking
	for _, b := range s.booking {
		if b.MovieID == movieId {
			result = append(result, b)
		}
	}

	return result
}

func (s *ConcurrentStore) ConfirmSeat(ctx context.Context, sessionId string, userId string) (Booking, error) {
	s.RLock()
	defer s.RUnlock()

	// 写入 booking 的状态为 "booked"
	for seatId, b := range s.booking {
		if b.ID == sessionId {
			b.Status = "booked"
			s.booking[seatId] = b
			return b, nil
		}
	}

	return Booking{}, nil
}

func (s *ConcurrentStore) ReleaseSeat(ctx context.Context, sessionId string) error {
	s.Lock()
	defer s.Unlock()

	// 找到 booking 对应的 seatId，并删除它
	for seatId, b := range s.booking {
		if b.ID == sessionId {
			delete(s.booking, seatId)
			break
		}
	}

	return nil
}
