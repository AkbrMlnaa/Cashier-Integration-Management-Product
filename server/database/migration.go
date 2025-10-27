package database

import (
	"log"
	"server/models"
)

func Migrate() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.Ingredient{},
		&models.IngredientStock{},
		&models.ProductIngredient{},
		&models.Transaction{},
		&models.TransactionDetail{},
	)
	if err != nil {
		log.Fatalf("Gagal migrate: %v", err)
	}

	log.Println("Migrasi database berhasil")
}
