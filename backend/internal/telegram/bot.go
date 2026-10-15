// Package telegram — минимальный клиент Telegram Bot API (long polling, без вебхука):
// работает и на localhost, публичный адрес не нужен.
//
// Как получить токен: напишите @BotFather → /newbot → скопируйте токен в TELEGRAM_BOT_TOKEN.
package telegram

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Bot struct {
	apiURL string // https://api.telegram.org (можно подменить для тестов)
	token  string
	http   *http.Client
	log    *slog.Logger

	mu       sync.RWMutex
	username string
}

// Message — входящее сообщение, которое нужно обработать
type Message struct {
	ChatID   int64
	Username string
	Text     string
}

func New(apiURL, token, username string, log *slog.Logger) *Bot {
	if apiURL == "" {
		apiURL = "https://api.telegram.org"
	}
	return &Bot{apiURL: strings.TrimRight(apiURL, "/"), token: token, username: strings.TrimPrefix(username, "@"), http: &http.Client{Timeout: 40 * time.Second}, log: log}
}

// Username — имя бота (для ссылки t.me/<username>). Пусто, пока бот не ответил на getMe.
func (b *Bot) Username() string {
	b.mu.RLock()
	defer b.mu.RUnlock()
	return b.username
}

type apiResponse struct {
	OK          bool            `json:"ok"`
	Result      json.RawMessage `json:"result"`
	Description string          `json:"description"`
}

func (b *Bot) call(ctx context.Context, method string, params url.Values, out any) error {
	endpoint := b.apiURL + "/bot" + b.token + "/" + method
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(params.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	res, err := b.http.Do(req)
	if err != nil {
		// не пишем в лог URL — в нём токен бота
		var ue *url.Error
		if errors.As(err, &ue) {
			return fmt.Errorf("telegram %s: %w", method, ue.Err)
		}
		return fmt.Errorf("telegram %s: %w", method, err)
	}
	defer res.Body.Close()
	var r apiResponse
	if err := json.NewDecoder(io.LimitReader(res.Body, 4<<20)).Decode(&r); err != nil {
		return fmt.Errorf("telegram %s: %w", method, err)
	}
	if !r.OK {
		return fmt.Errorf("telegram %s: %s", method, r.Description)
	}
	if out != nil {
		return json.Unmarshal(r.Result, out)
	}
	return nil
}

// Send отправляет сообщение с HTML-разметкой (<b>, <i>, <a href>)
func (b *Bot) Send(ctx context.Context, chatID int64, html string) error {
	return b.call(ctx, "sendMessage", url.Values{
		"chat_id":                  {strconv.FormatInt(chatID, 10)},
		"text":                     {html},
		"parse_mode":               {"HTML"},
		"disable_web_page_preview": {"true"},
	}, nil)
}

type update struct {
	UpdateID int64 `json:"update_id"`
	Message  *struct {
		Text string `json:"text"`
		Chat struct {
			ID   int64  `json:"id"`
			Type string `json:"type"`
		} `json:"chat"`
		From *struct {
			Username string `json:"username"`
		} `json:"from"`
	} `json:"message"`
}

// Run читает входящие сообщения (long polling), пока не отменён ctx.
func (b *Bot) Run(ctx context.Context, handle func(context.Context, Message)) {
	// узнаём имя бота
	for b.Username() == "" {
		var me struct {
			Username string `json:"username"`
		}
		if err := b.call(ctx, "getMe", url.Values{}, &me); err != nil {
			b.log.Warn("telegram недоступен, повтор через 30 с", "error", err)
			if !sleep(ctx, 30*time.Second) {
				return
			}
			continue
		}
		b.mu.Lock()
		b.username = me.Username
		b.mu.Unlock()
	}
	b.log.Info("telegram-бот запущен", "username", b.Username())

	var offset int64
	for ctx.Err() == nil {
		var updates []update
		err := b.call(ctx, "getUpdates", url.Values{
			"offset":          {strconv.FormatInt(offset, 10)},
			"timeout":         {"25"},
			"allowed_updates": {`["message"]`},
		}, &updates)
		if err != nil {
			if ctx.Err() != nil {
				return
			}
			b.log.Warn("telegram getUpdates", "error", err)
			sleep(ctx, 5*time.Second)
			continue
		}
		for _, u := range updates {
			offset = u.UpdateID + 1
			if u.Message == nil || u.Message.Chat.Type != "private" {
				continue
			}
			m := Message{ChatID: u.Message.Chat.ID, Text: strings.TrimSpace(u.Message.Text)}
			if u.Message.From != nil {
				m.Username = u.Message.From.Username
			}
			handle(ctx, m)
		}
	}
}

func sleep(ctx context.Context, d time.Duration) bool {
	t := time.NewTimer(d)
	defer t.Stop()
	select {
	case <-ctx.Done():
		return false
	case <-t.C:
		return true
	}
}
