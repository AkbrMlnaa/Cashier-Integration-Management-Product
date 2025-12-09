package main

import (
	"fmt"
	"log"
	"server/database"
	"server/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {

	database.ConnectDB()
	database.Migrate()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Content-Type, Authorization, Accept, Origin, Cookie",
		AllowCredentials: true,
	}))

	fmt.Println("Registering routes...")
	routes.SetupRoutes(app)

	fmt.Println("Server running on http://localhost:3030")
	log.Fatal(app.Listen(":3030"))
}
