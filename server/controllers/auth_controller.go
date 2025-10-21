package controllers

import (
	"fmt"
	"net/http"
	"server/database"
	"server/models"
	"server/utils"

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

	// Cek email unik
	var existing models.User
	if err := database.DB.Where("email = ?", user.Email).First(&existing).Error; err == nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "email sudah terdaftar",
		})
	}

	// Hash password
	hash, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 12)
	user.Password = string(hash)

	if user.Role == "" {
		user.Role = "cashier"
	}

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

    fmt.Println("Email:", req.Email)
    fmt.Println("Password:", req.Password) 
	
	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "email tidak ditemukan",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "password salah",
		})
	}

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
