package main

import (
	"fmt"
	"log"
	"os"
	"server/database"
	"server/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {

	database.ConnectDB()
	// database.Migrate()

	app := fiber.New()

	frontendURL := os.Getenv("FRONTEND_URL") 
    if frontendURL == "" {
        frontendURL = "http://localhost:5173"
    }

	app.Use(cors.New(cors.Config{
		AllowOrigins:     frontendURL,
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Content-Type, Authorization, Accept, Origin, Cookie",
		AllowCredentials: true,
	}))

	routes.SetupRoutes(app)
	port := os.Getenv("PORT")
	if port == "" {
		port = "3030"
	}

	fmt.Println("Server running on port", port)
	log.Fatal(app.Listen(":" + port))

}
