package redis

//! redis 的 Store 实现

import (
	"cinema-seat-booking/internal/booking"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	goredis "github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

const defaultHoldTTL = 2 * time.Minute

type Store struct {
	rdb *goredis.Client
}

func NewStore(rdb *goredis.Client) *Store {
	return &Store{rdb: rdb}
}

func sessionKey(id string) string {
	return fmt.Sprintf("Session:%s", id)
}

func parseSession(val string) (booking.Booking, error) {
	var data booking.Booking
	if err := json.Unmarshal([]byte(val), &data); err != nil {
		return booking.Booking{}, err
	}

	return data, nil
}

func (s *Store) Book(ctx context.Context, entry booking.Booking) (booking.Booking, error) {
	session, err := s.createHold(ctx, entry)
	if err != nil {
		return booking.Booking{}, fmt.Errorf("book seat %s for movie %s: %w", entry.SeatID, entry.MovieID, err)
	}

	log.Printf("Session booked %v", session)

	return session, nil
}

func (s *Store) ListBookings(ctx context.Context, movieID string) ([]booking.Booking, error) {
	pattern := fmt.Sprintf("seat:%s:*", movieID)

	var sessions []booking.Booking

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

	if err := iter.Err(); err != nil {
		return nil, fmt.Errorf("scan bookings for movie %s: %w", movieID, err)
	}

	return sessions, nil
}

func (s *Store) createHold(ctx context.Context, entry booking.Booking) (booking.Booking, error) {
	id := uuid.New().String()
	now := time.Now()

	entry.ID = id
	entry.Status = "held"
	entry.ExpiresAt = now.Add(defaultHoldTTL)

	// redis 的 key，格式为 "seat:{movieID}:{seatID}"，例如 seat:abc123:seat-5
	key := fmt.Sprintf("seat:%s:%s", entry.MovieID, entry.SeatID)
	// Booking 结构体的 JSON
	// json.Marshal 将 Go 结构体转换为 JSON 字节切片
	val, err := json.Marshal(entry)
	if err != nil {
		return booking.Booking{}, fmt.Errorf("marshal booking: %w", err)
	}

	// s.rdb.SetArgs 向 Redis 写入键值对
	res := s.rdb.SetArgs(ctx, key, val, goredis.SetArgs{
		Mode: "NX",
		TTL:  defaultHoldTTL,
	})
	if err := res.Err(); err != nil {
		return booking.Booking{}, fmt.Errorf("create seat hold: %w", err)
	}

	if res.Val() != "OK" {
		return booking.Booking{}, booking.ErrSeatAlreadyBooked
	}

	if err := s.rdb.Set(ctx, sessionKey(id), key, defaultHoldTTL).Err(); err != nil {
		if cleanupErr := s.rdb.Del(ctx, key).Err(); cleanupErr != nil {
			log.Printf("redis cleanup failed for %s: %v", key, cleanupErr)
		}
		return booking.Booking{}, fmt.Errorf("store session key: %w", err)
	}

	return entry, nil
}

func (s *Store) ConfirmSeat(ctx context.Context, sessionID string, userID string) (booking.Booking, error) {
	key, err := s.rdb.Get(ctx, sessionKey(sessionID)).Result()
	if err != nil {
		if errors.Is(err, goredis.Nil) {
			return booking.Booking{}, booking.ErrSessionNotFound
		}
		return booking.Booking{}, fmt.Errorf("lookup session %s: %w", sessionID, err)
	}

	val, err := s.rdb.Get(ctx, key).Result()
	if err != nil {
		if errors.Is(err, goredis.Nil) {
			return booking.Booking{}, booking.ErrSessionNotFound
		}
		return booking.Booking{}, fmt.Errorf("load seat hold for session %s: %w", sessionID, err)
	}

	session, err := parseSession(val)
	if err != nil {
		return booking.Booking{}, fmt.Errorf("parse seat hold for session %s: %w", sessionID, err)
	}

	session.UserID = userID
	session.Status = "booked"

	encoded, err := json.Marshal(session)
	if err != nil {
		return booking.Booking{}, fmt.Errorf("marshal confirmed session %s: %w", sessionID, err)
	}

	if err := s.rdb.Set(ctx, key, encoded, 0).Err(); err != nil {
		return booking.Booking{}, fmt.Errorf("persist confirmed session %s: %w", sessionID, err)
	}

	return session, nil
}

func (s *Store) ReleaseSeat(ctx context.Context, sessionID string) error {
	key, err := s.rdb.Get(ctx, sessionKey(sessionID)).Result()
	if err != nil {
		if errors.Is(err, goredis.Nil) {
			return booking.ErrSessionNotFound
		}
		return fmt.Errorf("lookup session %s: %w", sessionID, err)
	}

	if err := s.rdb.Del(ctx, key).Err(); err != nil {
		return fmt.Errorf("delete seat hold for session %s: %w", sessionID, err)
	}

	if err := s.rdb.Del(ctx, sessionKey(sessionID)).Err(); err != nil {
		return fmt.Errorf("delete session key %s: %w", sessionID, err)
	}

	return nil
}
