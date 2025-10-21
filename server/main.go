package main

import (
	"fmt"
	"log"
	"server/database"
	"server/routes"

	"github.com/gofiber/fiber/v2"
)

func main() {
	
	database.ConnectDB()
	database.Migrate()

	app := fiber.New()

	routes.SetupRoutes(app)

	fmt.Println("Server running on http://localhost:8080")
	log.Fatal(app.Listen(":8081"))
}
