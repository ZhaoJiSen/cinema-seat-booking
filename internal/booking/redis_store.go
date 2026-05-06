package booking

// Go 语法规定：方法定义时只能用 *  表示指针类型，不能用 &。& 只用于运行时获取地址

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

const defaultHoldTTL = 2 * time.Minute

type RedisStore struct {
	rdb *redis.Client
}

func newRedisStore(rdb *redis.Client) *RedisStore {
	return &RedisStore{rdb: rdb}
}

func sessionKey(id string) string {
	return fmt.Sprintf("Session:%s", id)
}

func (s *RedisStore) Book(b Booking) error {
	session, err := s.hold(b)
	if err != nil {
		return err
	}

	log.Printf("Session booked %v", session)

	return nil
}

func (s *RedisStore) ListBookings(movieId string) []Booking {
	return []Booking{}
}

// hold 方法用于创建一个新的预订会话，并返回该会话的详细信息
// 它生成一个唯一的 ID，设置过期时间，并返回一个 Booking 实例
func (s *RedisStore) hold(b Booking) (Booking, error) {
	id := uuid.New().String()
	now := time.Now()

	b.ID = id

	// 用于控制请求生命周期
	ctx := context.Background()
	// redis 的 key，格式为 "seat:{movieID}:{seatID}"，例如 seat:abc123:seat-5
	key := fmt.Sprintf("seat:%s:%s", b.MovieID, b.SeatID)
	// Booking 结构体的 JSON
	// json.Marshal 将 Go 结构体转换为 JSON 字节切片
	val, _ := json.Marshal(b)

	// s.rdb.SetArgs 向 Redis 写入键值对
	res := s.rdb.SetArgs(ctx, key, val, redis.SetArgs{
		Mode: "NX",           // 仅当键不存在时设置
		TTL:  defaultHoldTTL, // 过期时间，过期后 key 自动删除
	})

	ok := res.Val() == "OK"
	if !ok {
		return Booking{}, ErrSeatAlreadyBooked
	}

	s.rdb.Set(ctx, sessionKey(id), key, defaultHoldTTL)

	return Booking{
		ID:        id,
		MovieID:   b.MovieID,
		SeatID:    b.SeatID,
		UserID:    b.UserID,
		Status:    "held",
		ExpiresAt: now.Add(defaultHoldTTL),
	}, nil
}
