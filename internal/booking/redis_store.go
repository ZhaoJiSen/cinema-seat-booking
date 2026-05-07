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

func NewRedisStore(rdb *redis.Client) *RedisStore {
	return &RedisStore{rdb: rdb}
}

func sessionKey(id string) string {
	return fmt.Sprintf("Session:%s", id)
}

func (s *RedisStore) Book(b Booking) (Booking, error) {
	session, err := s.hold(b)
	if err != nil {
		return Booking{}, err
	}

	log.Printf("Session booked %v", session)

	return session, nil
}

func (s *RedisStore) ListBookings(movieId string) []Booking {
	pattern := fmt.Sprintf("seat:%s:*", movieId)

	var sessions []Booking

	ctx := context.Background()
	// 渐进式遍历 Redis 中的 key
	// 第一个参数是上下文，第二个参数是游标，第三个参数是匹配模式，第四个参数是每次返回的 key 数量（0 表示返回所有匹配的 key）
	// 上下文用于控制请求的生命周期，例如设置超时或取消请求
	// 游标用于记录扫描的位置，初始值为 0，每次调用 Scan 后会返回新的游标，直到游标再次返回 0 表示扫描完成
	// 匹配模式用于过滤 key，例如 seat:abc123:* 表示匹配所有以 seat:abc123: 开头的 key
	// 每次返回的 key 数量用于控制扫描的效率，过大可能导致阻塞，过小可能增加扫描次数
	iter := s.rdb.Scan(ctx, 0, pattern, 0).Iterator()
	for iter.Next(ctx) {
		val, err := s.rdb.Get(ctx, iter.Val()).Result()
		if err != nil {
			continue
		}

		session, err := parseSession(val)
		if err != nil {
			continue
		}

		sessions = append(sessions, session)
	}

	return sessions
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

func (s *RedisStore) ConfirmSeat(ctx context.Context, sessionId string, userId string) (Booking, error) {
	key, err := s.rdb.Get(ctx, sessionKey(sessionId)).Result()
	if err != nil {
		return Booking{}, err
	}

	if err := s.rdb.Set(ctx, key, "booked", 0).Err(); err != nil {
		return Booking{}, err
	}

	return Booking{
		ID:     sessionId,
		UserID: userId,
		Status: "booked",
	}, nil
}

func (s *RedisStore) ReleaseSeat(ctx context.Context, sessionId string) error {
	key, err := s.rdb.Get(ctx, sessionKey(sessionId)).Result()
	if err != nil {
		return err
	}

	if err := s.rdb.Del(ctx, key).Err(); err != nil {
		return err
	}

	if err := s.rdb.Del(ctx, sessionKey(sessionId)).Err(); err != nil {
		return err
	}

	return nil
}

func parseSession(val string) (Booking, error) {
	var data Booking
	if err := json.Unmarshal([]byte(val), &data); err != nil {
		return Booking{}, err
	}

	return data, nil
}
