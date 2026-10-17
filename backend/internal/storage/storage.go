package storage 
import (
	"context"
	"errors"
	"io"	
)
type Object struct {
	Body  io.ReadCloser
	Size int64
	ContentType string
}
type Storage interface {
	Put(ctx context.Context, key string, r io.Reader, size int64, contentType string) error
	Get(ctx context.Context, key string) (*Object, error)
	Delete(ctx context.Context, key string) error		
}
var ErrNotFound = errors.New("object not found")