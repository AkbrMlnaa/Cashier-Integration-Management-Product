package routes

import (
	"server/controllers"

	"github.com/gofiber/fiber/v2"
)

func AuthRoutes(router fiber.Router) {
	
	auth := router.Group("/auth")

	auth.Post("/register", controllers.Register)
	auth.Post("/login", controllers.Login)
	auth.Post("/refresh", controllers.RefreshToken)
	auth.Post("/logout", controllers.Logout)
}