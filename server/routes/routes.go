package routes

import (
	"server/controllers"
	"server/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// Group utama untuk semua endpoint API
	api := app.Group("/api")

	
	api.Post("/register", controllers.Register)
	api.Post("/login", controllers.Login)

	protected := api.Group("/v1", middleware.JWTProtected())
	protected.Post("/transactions", controllers.CreateTransaction)
	protected.Get("/products", controllers.GetAllProducts)

}
