package controllers

import (
	"fmt"
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

	// 1. CEK APA YANG DIKIRIM POSTMAN (Log ke Terminal)
	fmt.Printf("\n--- 📥 LOGIN REQUEST ---\n")
	fmt.Printf("Raw Email dari Postman: '%s'\n", req.Email)

	// Bersihkan input
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	fmt.Printf("Email setelah dibersihkan: '%s'\n", req.Email)

	var user models.User
	
	// 2. QUERY SIMPEL (Kita ganti strateginya)
	// Karena data di DB sudah pasti lowercase (kita lihat tadi di main.go),
	// kita tidak perlu pakai LOWER() di SQL. Langsung exact match saja biar driver tidak bingung.
	err := database.DB.Where("email = ?", req.Email).First(&user).Error
	
	if err != nil {
		// LOG ERROR KE TERMINAL
		fmt.Printf("❌ Query Gagal! Error: %v\n", err)
		fmt.Printf("------------------------\n\n")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "email tidak ditemukan", "detail": err.Error()})
	}

	// LOG SUKSES
	fmt.Printf("✅ User Ditemukan: ID=%d, Role=%s, Hash=%s\n", user.ID, user.Role, user.Password)

	// 3. Cek Password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		fmt.Printf("❌ Password Salah!\n")
		fmt.Printf("------------------------\n\n")
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "password salah"})
	}

	// Generate token access token
	accessToken, err := utils.GenerateJWT(user.ID, user.Email, user.Role, 15*time.Minute)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membuat access token"})
	}

	refreshToken, err := utils.GenerateJWT(user.ID, user.Email, user.Role, 7*24*time.Hour)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membuat refresh token"})
	}

	// Set Cookie
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		HTTPOnly: true,
		Secure:   true, // Tetap false untuk localhost
		SameSite: "Lax",
		Path:     "/",
		Expires:  time.Now().Add(35 * time.Minute),
	})

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Lax",
		Path:     "/",
		Expires:  time.Now().Add(1 * 24 * time.Hour),
	})

	fmt.Printf("✅ Login Berhasil!\n")
	fmt.Printf("------------------------\n\n")

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
        Secure:   true,
        SameSite: "Lax",
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
        Secure:   true,
        SameSite: "Lax",
        Path:     "/",
    })

    c.Cookie(&fiber.Cookie{
        Name:     "refresh_token",
        Value:    "",
        Expires:  time.Now().Add(-time.Hour),
        HTTPOnly: true,
        Secure:   true,
        SameSite: "Lax",
        Path:     "/",
    })

    return c.JSON(fiber.Map{"message": "Logout berhasil"})
}

