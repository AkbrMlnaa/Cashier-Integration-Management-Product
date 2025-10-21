package database

import "server/models"

func Migrate() {
	DB.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.Ingredient{},
		&models.IngredientStock{},
		&models.ProductIngredient{},
		&models.Transaction{},
		&models.TransactionDetail{},
	)
}
