-- Добавляем уникальный индекс на user_id
ALTER TABLE "google_oauth_credentials"
ADD CONSTRAINT "google_oauth_credentials_user_id_key" UNIQUE ("user_id");
