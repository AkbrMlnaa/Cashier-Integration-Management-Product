package repositories

import (
	"server/database"
	"server/models"
)

// CreateIngredient menyimpan ingredient baru ke database
func AddIngredient(ingredient *models.Ingredient) error {
	return database.DB.Create(ingredient).Error
}

// GetIngredientByID mengambil satu ingredient berdasarkan ID, termasuk stok
func GetIngredientByID(id uint) (models.Ingredient, error) {
	var ingredient models.Ingredient
	err := database.DB.Preload("Stock").First(&ingredient, id).Error
	return ingredient, err
}

// GetAllIngredients mengambil semua ingredient beserta stoknya
func GetAllIngredients() ([]models.Ingredient, error) {
	var ingredients []models.Ingredient
	err := database.DB.Preload("Stock").Find(&ingredients).Error
	return ingredients, err
}

// UpdateIngredient menyimpan perubahan data ingredient
func UpdateIngredient(ingredient *models.Ingredient) error {
	return database.DB.Save(ingredient).Error
}

// DeleteIngredient menghapus ingredient dan stoknya
func DeleteIngredient(id uint) error {
	if err := database.DB.Where("ingredient_id = ?", id).Delete(&models.IngredientStock{}).Error; err != nil {
		return err
	}
	return database.DB.Delete(&models.Ingredient{}, id).Error
}

// CreateInitialStock membuat stok awal (0) untuk ingredient baru
func CreateInitialStock(ingredientID uint) error {
	stock := models.IngredientStock{
		IngredientID: ingredientID,
		Quantity:     0,
	}
	return database.DB.Create(&stock).Error
}

// GetStockByIngredientID mengambil stok berdasarkan ingredient_id
func GetStockByIngredientID(ingredientID uint) (models.IngredientStock, error) {
	var stock models.IngredientStock
	err := database.DB.Where("ingredient_id = ?", ingredientID).First(&stock).Error
	return stock, err
}

// UpdateStockQuantity memperbarui jumlah stok
func UpdateStockQuantity(ingredientID uint, quantity float64) (models.IngredientStock, error) {
	var stock models.IngredientStock
	if err := database.DB.Where("ingredient_id = ?", ingredientID).First(&stock).Error; err != nil {
		return stock, err
	}

	stock.Quantity = quantity
	err := database.DB.Save(&stock).Error
	return stock, err
}
