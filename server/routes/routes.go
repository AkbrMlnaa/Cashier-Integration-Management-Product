package routes

import (
	"server/controllers"
	"server/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {

	AuthRoutes(app)

	protected := app.Group("/v1", middleware.JWTProtected())
	
	// Transaction routes
	protected.Post("/transactions", controllers.CreateTransaction)

	// Ingredient routes
	protected.Post("/ingredients", controllers.AddIngredient)
	protected.Get("/ingredients", controllers.GetAllIngredients)
	protected.Get("/ingredients/:id", controllers.GetIngredientByID)
	protected.Put("/ingredients/:id", controllers.UpdateIngredient)
	protected.Delete("/ingredients/:id", controllers.DeleteIngredient)

	protected.Put("/ingredients/:id/stock", controllers.UpdateIngredientStock)

	// Product routes
	protected .Post("/products", controllers.AddProduct)
	protected .Get("/products", controllers.GetAllProducts)
	protected .Get("/products/:id", controllers.GetProductByID)
	protected .Put("/products/:id", controllers.UpdateProduct)
	protected .Delete("/products/:id", controllers.DeleteProduct)

	protected .Put("/products/:id/ingredients", controllers.UpsertProductIngredients)

}
