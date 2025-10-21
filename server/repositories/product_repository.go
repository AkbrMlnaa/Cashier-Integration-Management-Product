package repositories

import (
	"server/database"
	"server/models"
)

func GetAllProducts() ([]models.Product, error) {
	var products []models.Product
	err := database.DB.Preload("Ingredients").Find(&products).Error
	return products, err
}
