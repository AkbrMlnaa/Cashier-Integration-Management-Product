package database

import (
	"fmt"
	"log"
	"server/config"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	config.LoadEnv()

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s client_encoding=UTF8 search_path=public prefer_simple_protocol=true",
		config.GetEnv("DB_HOST"),
		config.GetEnv("DB_USER"),
		config.GetEnv("DB_PASSWORD"),
		config.GetEnv("DB_NAME"),
		config.GetEnv("DB_PORT"),
		config.GetEnv("DB_SSLMODE"),
	)

	var err error

	dbConfig := postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, 
	}

	DB, err = gorm.Open(postgres.New(dbConfig), &gorm.Config{
		PrepareStmt: false, 
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	sqlDB, _ := DB.DB()
	sqlDB.SetMaxIdleConns(2)
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)

	fmt.Println("Database connected successfully")
}