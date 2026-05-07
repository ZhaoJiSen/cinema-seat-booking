package redis

import (
	"context"
	"log"

	"github.com/go-redis/redis/v8"
)

func NewClient(addr string) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatalf("redis ping %v", err)
	}

	log.Printf("Connected to Redis at %s", addr)

	return rdb
}
