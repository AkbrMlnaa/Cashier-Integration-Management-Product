package repositories

import (
	"server/database"
	"server/models"
)


func AddIngredient(ingredient *models.Ingredient) error {
	return database.DB.Create(ingredient).Error
}


func GetIngredientByID(id uint) (models.Ingredient, error) {
	var ingredient models.Ingredient
	err := database.DB.Preload("Stock").First(&ingredient, id).Error
	return ingredient, err
}


func GetAllIngredients() ([]models.Ingredient, error) {
	var ingredients []models.Ingredient
	err := database.DB.Preload("Stock").Find(&ingredients).Error
	return ingredients, err
}


func UpdateIngredient(ingredient *models.Ingredient) error {
	return database.DB.Save(ingredient).Error
}


func DeleteIngredient(id uint) error {
	if err := database.DB.Where("ingredient_id = ?", id).Delete(&models.IngredientStock{}).Error; err != nil {
		return err
	}
	return database.DB.Delete(&models.Ingredient{}, id).Error
}


func CreateInitialStock(ingredientID uint) error {
	stock := models.IngredientStock{
		IngredientID: ingredientID,
		Quantity:     0,
	}
	return database.DB.Create(&stock).Error
}


func GetStockByIngredientID(ingredientID uint) (models.IngredientStock, error) {
	var stock models.IngredientStock
	err := database.DB.Where("ingredient_id = ?", ingredientID).First(&stock).Error
	return stock, err
}

func UpdateStockQuantity(ingredientID uint, quantity float64) (models.IngredientStock, error) {
	var stock models.IngredientStock
	if err := database.DB.Where("ingredient_id = ?", ingredientID).First(&stock).Error; err != nil {
		return stock, err
	}

	stock.Quantity = quantity
	err := database.DB.Save(&stock).Error
	return stock, err
}
