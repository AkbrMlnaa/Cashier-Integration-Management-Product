package controllers

import (
	"server/database"
	"server/models"

	"github.com/gofiber/fiber/v2"
)

func CreateTransaction(c *fiber.Ctx) error {
	var transaction models.Transaction
	if err := c.BodyParser(&transaction); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	tx := database.DB.Begin()

	if err := tx.Create(&transaction).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}


	for _, detail := range transaction.Details {
		var product models.Product
		if err := tx.First(&product, detail.ProductID).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "produk tidak ditemukan",
			})
		}

		if product.Stock < detail.Quantity {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "stok produk tidak cukup",
			})
		}

		product.Stock -= detail.Quantity
		tx.Save(&product)

		
		var productIngredients []models.ProductIngredient
		tx.Where("product_id = ?", product.ID).Find(&productIngredients)

		for _, pi := range productIngredients {
			var stock models.IngredientStock
			tx.Where("ingredient_id = ?", pi.IngredientID).First(&stock)

			requiredQty := pi.Quantity * float64(detail.Quantity)
			if stock.Quantity < requiredQty {
				tx.Rollback()
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "stok bahan baku tidak cukup",
				})
			}
			stock.Quantity -= requiredQty
			tx.Save(&stock)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Transaksi berhasil dibuat",
		"data":    transaction,
	})
}
