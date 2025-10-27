package repositories

import (
	"server/database"
	"server/models"
)

func AddProduct(product *models.Product) error {
	return database.DB.Create(product).Error
}

func GetAllProducts() ([]models.Product, error) {
	var products []models.Product
	err := database.DB.Preload("Ingredients.Ingredient").Find(&products).Error
	return products, err
}

func GetProductByID(id uint) (models.Product, error) {
	var product models.Product
	err := database.DB.Preload("Ingredients.Ingredient").First(&product, id).Error
	return product,err
}

func UpdateProduct(product *models.Product) error {
	return database.DB.Save(product).Error
}

func DeleteProduct(id uint) error {
	database.DB.Where("product_id = ?", id).Delete(&models.ProductIngredient{})
	return database.DB.Delete(&models.Product{}, id).Error
}
