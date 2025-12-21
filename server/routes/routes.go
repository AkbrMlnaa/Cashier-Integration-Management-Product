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
		middleware.RBAC("manager", "cashier"),
		controllers.GetProfile)

	// Transaction routes
	protected.Post("/transactions",
		middleware.RBAC("manager", "cashier"),
		controllers.AddTransaction)
	protected.Get("/transactions",
		middleware.RBAC("manager"),
		controllers.GetAllTransactions)
	protected.Get("/transactions/:id",
		middleware.RBAC("manager"),
		controllers.GetTransactionByID)

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
	protected.Post("/products",
		middleware.RBAC("manager", "cashier"),
		controllers.AddProduct)
	protected.Get("/products",
		middleware.RBAC("manager", "cashier"),
		controllers.GetAllProducts)
	protected.Get("/products/:id",
		middleware.RBAC("manager", "cashier"),
		controllers.GetProductByID)
	protected.Put("/products/:id",
		middleware.RBAC("manager", "cashier"),
		controllers.UpdateProduct)
	protected.Delete("/products/:id",
		middleware.RBAC("manager", "cashier"),
		controllers.DeleteProduct)

	protected.Put("/products/:id/ingredients",
		middleware.RBAC("manager", "cashier"),
		controllers.UpsertProductIngredients)

}
