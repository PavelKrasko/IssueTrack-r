package httpapi

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"path"
	"strings"
	"time"

	"issuetracker/internal/database/db"
)

const maxAvatarSize = 2 << 20 // 2 МБ

// uploadAvatar: multipart/form-data, поле "file". Заменяет текущий аватар (в т.ч. от Google/GitHub).
func (s *Server) uploadAvatar(w http.ResponseWriter, r *http.Request) error {
	r.Body = http.MaxBytesReader(w, r.Body, maxAvatarSize+1<<20)
	file, _, err := r.FormFile("file")
	if err != nil {
		return errBadRequest("Не удалось прочитать файл. Максимальный размер — 2 МБ.", map[string]string{"file": "Выберите изображение до 2 МБ."})
	}
	defer file.Close()
	data, err := io.ReadAll(io.LimitReader(file, maxAvatarSize+1))
	if err != nil {
		return err
	}
	if len(data) == 0 {
		return errBadRequest("Файл пустой.", nil)
	}
	if len(data) > maxAvatarSize {
		return errBadRequest("Изображение больше 2 МБ.", map[string]string{"file": "Максимум — 2 МБ."})
	}
	ct := http.DetectContentType(data)
	if !imageTypes[ct] {
		return errBadRequest("Это не изображение. Подходят PNG, JPG, GIF и WebP.", map[string]string{"file": "Подходят PNG, JPG, GIF и WebP."})
	}

	ctx := r.Context()
	u, err := s.q.GetUserByID(ctx, userID(r))
	if err != nil {
		return err
	}
	// новый ключ на каждую загрузку: старая картинка не «залипнет» в кэше браузера
	now := time.Now().UnixMilli()
	key := fmt.Sprintf("users/%s/avatar-%d.%s", u.ID, now, strings.TrimPrefix(ct, "image/"))
	if err := s.store.Put(ctx, key, bytes.NewReader(data), int64(len(data)), ct); err != nil {
		return err
	}
	url := fmt.Sprintf("/api/users/%s/avatar?v=%d", u.ID, now)
	updated, err := s.q.SetUserAvatar(ctx, db.SetUserAvatarParams{ID: u.ID, AvatarUrl: &url, AvatarKey: &key})
	if err != nil {
		s.deleteObjects(key)
		return err
	}
	if u.AvatarKey != nil {
		s.deleteObjects(*u.AvatarKey)
	}
	out, err := s.userResponse(ctx, updated)
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, out)
	return nil
}

// deleteAvatar убирает аватар — остаются инициалы.
func (s *Server) deleteAvatar(w http.ResponseWriter, r *http.Request) error {
	ctx := r.Context()
	u, err := s.q.GetUserByID(ctx, userID(r))
	if err != nil {
		return err
	}
	updated, err := s.q.SetUserAvatar(ctx, db.SetUserAvatarParams{ID: u.ID})
	if err != nil {
		return err
	}
	if u.AvatarKey != nil {
		s.deleteObjects(*u.AvatarKey)
	}
	out, err := s.userResponse(ctx, updated)
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, out)
	return nil
}

// userAvatar отдаёт загруженный аватар любого пользователя (только вошедшим).
func (s *Server) userAvatar(w http.ResponseWriter, r *http.Request) error {
	id, err := urlUUID(r, "userID", "Пользователь")
	if err != nil {
		return err
	}
	u, err := s.q.GetUserByID(r.Context(), id)
	if err != nil {
		return err
	}
	if u.AvatarKey == nil {
		return errNotFound("Аватар не загружен.")
	}
	// тип записан в расширении ключа (avatar-….png); на всякий случай — только картинки
	ct := "image/" + strings.TrimPrefix(path.Ext(*u.AvatarKey), ".")
	if !imageTypes[ct] {
		ct = "application/octet-stream"
	}
	return s.serveObject(w, r, *u.AvatarKey, "avatar", ct, true)
}
