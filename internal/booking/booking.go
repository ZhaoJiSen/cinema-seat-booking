package booking

import "time"

// struct 用来定义一个实体的数据结构
type Booking struct {
	ID        string
	MovieID   string
	SeatID    string
	UserID    string
	Status    string
	ExpiresAt time.Time
}
