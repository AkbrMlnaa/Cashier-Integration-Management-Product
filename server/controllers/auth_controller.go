package controllers

import (
	"net/http"
	"server/database"
	"server/models"
	"server/utils"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role,omitempty"` 
}

func Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "input tidak valid"})
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	if req.Name == "" || req.Email == "" || req.Password == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "name, email, dan password wajib diisi"})
	}

	if !strings.Contains(req.Email, "@") {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "format email tidak valid"})
	}

	var existing models.User
	if err := database.DB.Where("LOWER(email) = ?", req.Email).First(&existing).Error; err == nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "email sudah terdaftar"})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "gagal mengenkripsi password"})
	}

	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hash),
		Role:     req.Role,
	}

	// validasi role sesuai check constraint
	role := strings.ToLower(user.Role)
	switch role {
	case "manager", "cashier":
		user.Role = role
	default:
		user.Role = "cashier"
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "registrasi berhasil",
		"data": fiber.Map{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}




func Login(c *fiber.Ctx) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "input tidak valid"})
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	var user models.User
	if err := database.DB.Where("LOWER(email) = LOWER(?)", req.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "email tidak ditemukan"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "password salah"})
	}

	// Generate token dengan error handling
	accessToken, err := utils.GenerateJWT(user.ID, user.Email, user.Role, 15*time.Minute)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membuat access token"})
	}

	refreshToken, err := utils.GenerateJWT(user.ID, user.Email, user.Role, 7*24*time.Hour)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membuat refresh token"})
	}

	
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		HTTPOnly: true,
		Secure:   false, // ubah ke true saat production
		SameSite: "None",
		Path:     "/",
		Expires:  time.Now().Add(35 * time.Minute),
	})


	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HTTPOnly: true,
		Secure:   false, 
		SameSite: "None",
		Path:     "/",
		Expires:  time.Now().Add(7 * 24 * time.Hour),
	})

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "login berhasil",
	})
}

func RefreshToken(c *fiber.Ctx) error {
    refreshToken := c.Cookies("refresh_token")
    if refreshToken == "" {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "refresh token tidak ditemukan",
        })
    }

    claims, err := utils.VerifyToken(refreshToken)
    if err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "refresh token tidak valid atau kadaluarsa",
        })
    }

    newAccessToken, err := utils.GenerateJWT(
        claims.UserID,
        claims.Email,
        claims.Role,
        15*time.Minute,
    )

    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "gagal membuat access token baru",
        })
    }

    c.Cookie(&fiber.Cookie{
        Name:     "access_token",
        Value:    newAccessToken,
        HTTPOnly: true,
        Secure:   false,
        SameSite: "None",
        Path:     "/",
        Expires:  time.Now().Add(15 * time.Minute),
    })

    return c.JSON(fiber.Map{
        "status":  "success",
        "message": "access token berhasil diperbarui",
    })
}


func Logout(c *fiber.Ctx) error {
    c.Cookie(&fiber.Cookie{
        Name:     "access_token",
        Value:    "",
        Expires:  time.Now().Add(-time.Hour),
        HTTPOnly: true,
        Secure:   false,
        SameSite: "None",
        Path:     "/",
    })

    c.Cookie(&fiber.Cookie{
        Name:     "refresh_token",
        Value:    "",
        Expires:  time.Now().Add(-time.Hour),
        HTTPOnly: true,
        Secure:   false,
        SameSite: "None",
        Path:     "/",
    })

    return c.JSON(fiber.Map{"message": "Logout berhasil"})
}

