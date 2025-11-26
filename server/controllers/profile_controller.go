package controllers

import "github.com/gofiber/fiber/v2"

func GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	email := c.Locals("email")
	role := c.Locals("role")

	return c.JSON(fiber.Map{
		"id":    userID,
		"email": email,
		"role":  role,
	})
}
