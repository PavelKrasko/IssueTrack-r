.PHONY: run build tidy sqlc infra infra-down psql test

# Переменные из .env
ifneq (,$(wildcard .env))
include .env
export
endif

## Запустить API локально (нужен PostgreSQL: make infra)
run:
	go run ./cmd/api

build:
	CGO_ENABLED=0 go build -o bin/api ./cmd/api

## Скачать зависимости и создать go.sum (выполнить один раз после распаковки)
tidy:
	go mod tidy

## Перегенерировать Go-код из SQL (internal/database/queries → internal/database/db)
## Установка: go install github.com/sqlc-dev/sqlc/cmd/sqlc@v1.27.0
sqlc:
	sqlc generate

## Поднять только PostgreSQL из общего docker-compose
infra:
	docker compose -f ../docker-compose.yml up -d postgres

infra-down:
	docker compose -f ../docker-compose.yml stop postgres

psql:
	docker compose -f ../docker-compose.yml exec postgres psql -U issuetracker

test:
	go vet ./... && go test ./...
