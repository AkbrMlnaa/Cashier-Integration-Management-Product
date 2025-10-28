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
	if err := database.DB.
		Preload("Ingredients.Ingredient.Stock").       
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
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

// func UpsertProductIngredients(productID uint, newIngredients []models.ProductIngredient) error {
// 	tx := database.DB.Begin()

// 	// Ambil ingredient yang sudah ada
// 	var existing []models.ProductIngredient
// 	if err := tx.Where("product_id = ?", productID).Find(&existing).Error; err != nil {
// 		tx.Rollback()
// 		return err
// 	}

// 	existingMap := make(map[uint]models.ProductIngredient)
// 	for _, e := range existing {
// 		existingMap[e.IngredientID] = e
// 	}

// 	// Loop untuk insert atau update
// 	for _, newItem := range newIngredients {
// 		newItem.ProductID = productID

// 		if existingItem, found := existingMap[newItem.IngredientID]; found {
// 			if existingItem.Quantity != newItem.Quantity {
// 				if err := tx.Model(&models.ProductIngredient{}).
// 					Where("product_id = ? AND ingredient_id = ?", productID, newItem.IngredientID).
// 					Update("quantity", newItem.Quantity).Error; err != nil {
// 					tx.Rollback()
// 					return err
// 				}
// 			}
// 			delete(existingMap, newItem.IngredientID) // hapus dari map agar tahu mana yg harus dihapus
// 		} else {
// 			// Insert baru
// 			if err := tx.Create(&newItem).Error; err != nil {
// 				tx.Rollback()
// 				return err
// 			}
// 		}
// 	}

// 	// Hapus ingredient yang tidak ada di request
// 	for ingredientID := range existingMap {
// 		if err := tx.Where("product_id = ? AND ingredient_id = ?", productID, ingredientID).
// 			Delete(&models.ProductIngredient{}).Error; err != nil {
// 			tx.Rollback()
// 			return err
// 		}
// 	}

// 	return tx.Commit().Error
// }


func UpsertProductIngredients(productID uint, newIngredients []models.ProductIngredient) error {
	tx := database.DB.Begin()

	var existing []models.ProductIngredient
	if err := tx.Where("product_id = ?", productID).Find(&existing).Error; err != nil {
		tx.Rollback()
		return err
	}

	existingMap := make(map[uint]models.ProductIngredient)
	for _, e := range existing {
		existingMap[e.IngredientID] = e
	}


	for _, newIng := range newIngredients {
		if existingItem, found := existingMap[newIng.IngredientID]; found {
			// update quantity kalau berbeda
			if existingItem.Quantity != newIng.Quantity {
				if err := tx.Model(&models.ProductIngredient{}).
					Where("product_id = ? AND ingredient_id = ?", productID, newIng.IngredientID).
					Update("quantity", newIng.Quantity).Error; err != nil {
					tx.Rollback()
					return err
				}
			}
			delete(existingMap, newIng.IngredientID)
		} else {
			// tambahkan ingredient baru
			if err := tx.Create(&newIng).Error; err != nil {
				tx.Rollback()
				return err
			}
		}
	}

	// hapus ingredient yang tidak ada di data baru
	for ingredientID := range existingMap {
		if err := tx.Where("product_id = ? AND ingredient_id = ?", productID, ingredientID).
			Delete(&models.ProductIngredient{}).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}
