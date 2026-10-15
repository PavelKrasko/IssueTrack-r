// Package auth: пароли, токены доступа, OAuth.
package auth

import (
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

const bcryptCost = 12

func HashPassword(password string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	return string(b), err
}

func CheckPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

// dummyHash — чтобы проверка несуществующего пользователя занимала столько же времени
// и по времени ответа нельзя было угадать, зарегистрирован ли email.
var dummyHash, _ = bcrypt.GenerateFromPassword([]byte("dummy-password-for-timing"), bcryptCost)

func BurnPasswordCheck(password string) {
	_ = bcrypt.CompareHashAndPassword(dummyHash, []byte(password))
}

// ValidatePassword — те же правила, что и на фронтенде: от 8 символов, буква и цифра.
// bcrypt учитывает только первые 72 байта, поэтому ограничиваем длину.
func ValidatePassword(p string) string {
	if len([]rune(p)) < 8 {
		return "Пароль должен быть не короче 8 символов."
	}
	if len(p) > 72 {
		return "Пароль слишком длинный (максимум 72 байта)."
	}
	var letter, digit bool
	for _, r := range p {
		if unicode.IsLetter(r) {
			letter = true
		}
		if unicode.IsDigit(r) {
			digit = true
		}
	}
	if !letter || !digit {
		return "Пароль должен содержать хотя бы одну букву и одну цифру."
	}
	return ""
}
