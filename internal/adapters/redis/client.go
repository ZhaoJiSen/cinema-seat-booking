package redis

import (
	"context"
	"fmt"
	"log"

	goredis "github.com/go-redis/redis/v8"
)

func NewClient(ctx context.Context, addr string) (*goredis.Client, error) {
	rdb := goredis.NewClient(&goredis.Options{
		Addr: addr,
	})

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("ping redis at %s: %w", addr, err)
	}

	log.Printf("Connected to Redis at %s", addr)

	return rdb, nil
}
