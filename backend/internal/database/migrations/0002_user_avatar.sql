-- Загруженный пользователем аватар: ключ файла в хранилище.
-- avatar_url остаётся адресом для фронтенда: либо ссылка Google/GitHub,
-- либо /api/users/{id}/avatar?v=… для загруженного файла.
ALTER TABLE users ADD COLUMN avatar_key text;
