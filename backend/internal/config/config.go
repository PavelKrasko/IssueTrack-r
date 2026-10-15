package config
import (
	"fmt"
	"os"
)
type Config struct {
	HTTPAddr    string
	DatabaseURL string
	JWTSecret   string
}
func Load() (*Config, error) {
	c := &Config{
		HTTPAddr:    env("HTTP_ADDR", ":8080"),
		DatabaseURL: env("DATABASE_URL", "postgres://issuetracker:issuetracker@localhost:5432/issuetracker?sslmode=disable"),
		JWTSecret:   os.Getenv("JWT_SECRET"),
	}
	if len(c.JWTSecret) < 32 {
		return nil, fmt.Errorf("JWT_SECRET должен быть не короче 32 символов (сгенерируйте: openssl rand -hex 32)")
	}
	return c, nil
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}