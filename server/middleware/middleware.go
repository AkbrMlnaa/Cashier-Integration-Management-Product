package middleware

import (
	"server/utils"

	"github.com/gofiber/fiber/v2"
)

func JWTProtected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Cookies("access_token")
		if tokenString == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "token tidak ditemukan",
			})
		}

		claims, err := utils.VerifyToken(tokenString)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "token tidak valid atau kadaluarsa",
			})
		}

		c.Locals("user_id", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("role", claims.Role)

		return c.Next()
	}
}


func RBAC(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		role := c.Locals("role")

		if role == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "role tidak ditemukan dalam token",
			})
		}

		for _, r := range allowedRoles {
			if r == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "akses ditolak, role tidak memiliki izin",
		})
	}
}

