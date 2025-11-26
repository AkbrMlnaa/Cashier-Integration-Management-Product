package routes

import (
	"server/controllers"
	"server/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {

	AuthRoutes(app)

	protected := app.Group("/v1", middleware.JWTProtected())

	// Profile routes
	protected.Get("/profile",
		middleware.RBAC("manager","cashier"),
		controllers.GetProfile)

	// Transaction routes
	protected.Post("/transactions", controllers.CreateTransaction)

	// Ingredient routes
	protected.Post("/ingredients",
		middleware.RBAC("manager", "cashier"),
		controllers.AddIngredient)
	protected.Get("/ingredients",
		middleware.RBAC("manager", "cashier"),
		controllers.GetAllIngredients)
	protected.Get("/ingredients/:id",
		middleware.RBAC("manager", "cashier"),
		controllers.GetIngredientByID)
	protected.Put("/ingredients/:id",
		middleware.RBAC("manager", "cashier"),
		controllers.UpdateIngredient)
	protected.Delete("/ingredients/:id",
		middleware.RBAC("manager", "cashier"),
		controllers.DeleteIngredient)

	protected.Put("/ingredients/:id/stock",
		middleware.RBAC("manager", "cashier"),
		controllers.UpdateIngredientStock)

	// Product routes
	protected.Post("/products", controllers.AddProduct)
	protected.Get("/products", controllers.GetAllProducts)
	protected.Get("/products/:id", controllers.GetProductByID)
	protected.Put("/products/:id", controllers.UpdateProduct)
	protected.Delete("/products/:id", controllers.DeleteProduct)

	protected.Put("/products/:id/ingredients", controllers.UpsertProductIngredients)

}
