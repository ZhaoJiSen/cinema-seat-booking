package booking

import "context"

// MemoryStore 是 BookingStore 接口的一个实现
// GO 不需要显式写 implements，而是只要方法对上了，就自动算实现了
// BookingStore 需要实现 Booking 和 ListBookings 两个方法
type MemoryStore struct {
	bookings map[string]Booking
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		bookings: make(map[string]Booking),
	}
}

// Book 方法实现了 BookingStore 接口中的 Book 方法，用于处理预订逻辑
// 首先检查座位是否已经被预订，如果是，则返回 ErrSeatAlreadyBooked 错误
// 如果座位未被预订，则将预订信息存储在 bookings map 中，并返回 nil 表示成功
func (s *MemoryStore) Book(b Booking) error {
	if _, exists := s.bookings[b.SeatID]; exists {
		return ErrSeatAlreadyBooked
	}

	s.bookings[b.SeatID] = b
	return nil
}

// ListBookings 方法实现了 BookingStore 接口中的 ListBookings 方法，用于列出指定电影的所有预订
// 该方法遍历 bookings map，筛选出与指定 movieId 匹配的预订，并将它们添加到结果切片中返回
// 如果没有找到任何匹配的预订，则返回一个空切片
func (s *MemoryStore) ListBookings(movieId string) []Booking {
	var result []Booking

	for _, b := range s.bookings {
		if b.MovieID == movieId {
			result = append(result, b)
		}
	}

	return result
}

func (s *MemoryStore) ConfirmSeat(ctx context.Context, sessionId string, userId string) (Booking, error) {
	// Memory 没有锁直接操作
	for seatId, b := range s.bookings {
		if b.ID == sessionId {
			b.Status = "booked"
			s.bookings[seatId] = b
			return b, nil
		}
	}

	return Booking{}, nil
}

func (s *MemoryStore) ReleaseSeat(ctx context.Context, sessionId string) error {
	for seatId, b := range s.bookings {
		if b.ID == sessionId {
			delete(s.bookings, seatId)
			return nil
		}
	}
	return nil
}
