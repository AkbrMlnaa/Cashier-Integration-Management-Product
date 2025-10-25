package controllers

import (
	"fmt"
	"net/http"
	"server/database"
	"server/models"
	"server/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)


func Register(c *fiber.Ctx) error {
	var user models.User

	if err := c.BodyParser(&user); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	user.Email = strings.ToLower(strings.TrimSpace(user.Email))

	var existing models.User
	if err := database.DB.Where("email = ?", user.Email).First(&existing).Error; err == nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "email sudah terdaftar",
		})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), 12)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "gagal mengenkripsi password",
		})
	}
	user.Password = string(hash)

	fmt.Println("DEBUG - Password plain input:", c.FormValue("password"))
	fmt.Println("DEBUG - Password hash disimpan:", user.Password)


	if user.Role == "" {
		user.Role = "cashier"
	}

	// Simpan user ke database
	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"message": "Registrasi berhasil",
		"data": fiber.Map{
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
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))


	var user models.User
	result := database.DB.Where("LOWER(email) = LOWER(?)", req.Email).First(&user)
	if result.Error != nil {
		fmt.Println("ERROR - User tidak ditemukan:", result.Error)
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "email tidak ditemukan",
		})
	}

	fmt.Println("DEBUG - Email:", req.Email)
	fmt.Println("DEBUG - Input Password:", req.Password)
	fmt.Println("DEBUG - Hash from DB:", user.Password)

	// Bandingkan password input (plain) dengan hash dari DB
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		fmt.Println("Compare error:", err)
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "password salah",
		})
	}

	// Jika cocok → generate JWT
	token, err := utils.GenerateJWT(user.ID, user.Email, user.Role)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "gagal membuat token",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Login berhasil",
		"token":   token,
	})
}
