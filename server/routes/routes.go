package routes

import (
	"server/controllers"
	"server/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	
	api := app.Group("/api")

	AuthRoutes(api)

	protected := api.Group("/v1", middleware.JWTProtected())

	protected.Post("/transactions", controllers.CreateTransaction)
	

	protected.Post("/ingredients", controllers.AddIngredient)          
	protected.Get("/ingredients", controllers.GetAllIngredients)          
	protected.Get("/ingredients/:id", controllers.GetIngredientByID)      
	protected.Delete("/ingredients/:id", controllers.DeleteIngredient)     
	protected.Put("/ingredients/:id", controllers.UpdateIngredient)
	protected.Put("/ingredients/:id/stock", controllers.UpdateIngredientStock)
}
