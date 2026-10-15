# ── сборка ──
FROM golang:1.23-alpine AS build
WORKDIR /app
# сначала только зависимости — этот слой кэшируется, пока не меняется go.mod
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
# go mod tidy допишет go.sum, если его нет (первая сборка)
RUN go mod tidy && CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/app ./cmd/api

# ── запуск ──
FROM alpine:3.20
# сертификаты — для HTTPS к Google, GitHub и Telegram; tzdata — часовые пояса
RUN apk add --no-cache ca-certificates tzdata \
 && addgroup -S myuser && adduser -S -G myuser myuser \
 && mkdir -p /data/uploads && chown myuser:myuser /data/uploads
WORKDIR /app
COPY --from=build --chown=myuser:myuser /out/app /app/app
ENV STORAGE_DIR=/data/uploads
USER myuser
EXPOSE 8080
ENTRYPOINT ["/app/app"]
