package database
import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)
func Connect(ctx context.Context, url string, log *slog.Logger) (*pgxpool.Pool, error){
	cfg, err := pgxpool.ParseConfig(url)
	if err != nil{
		return nil, fmt.Errorf("DATABASE_URL: %w", err)
	}
	cfg.MaxConns = 20
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err 
}
 