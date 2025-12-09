package controllers

import (
	"server/database"
	"server/models"
	"server/repositories"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func AddTransaction(c *fiber.Ctx) error {
	var transaction models.Transaction

	// Parse body
	if err := c.BodyParser(&transaction); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	// Ambil user ID dari JWT
	userIDInterface := c.Locals("user_id")
	if userIDInterface == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "user not authenticated",
		})
	}
	userID, ok := userIDInterface.(uint)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to parse user id from JWT",
		})
	}
	transaction.UserID = &userID

	tx := database.DB.Begin()

	// --- Gabungkan detail yang duplicate berdasarkan product_id ---
	detailMap := make(map[uint]*models.TransactionDetail)
	for i := range transaction.Details {
		d := transaction.Details[i]
		if existing, ok := detailMap[*d.ProductID]; ok {
			existing.Quantity += d.Quantity
		} else {
			detailMap[*d.ProductID] = &models.TransactionDetail{
				ProductID: d.ProductID,
				Quantity:  d.Quantity,
			}
		}
	}

	// Convert map ke slice
	newDetails := []models.TransactionDetail{}
	for _, v := range detailMap {
		newDetails = append(newDetails, *v)
	}
	transaction.Details = newDetails

	// --- Hitung harga & subtotal dari DB ---
	var total float64 = 0
	for i := range transaction.Details {
		var product models.Product
		if err := tx.First(&product, transaction.Details[i].ProductID).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "produk tidak ditemukan",
			})
		}
		transaction.Details[i].Price = product.Price
		transaction.Details[i].Subtotal = product.Price * float64(transaction.Details[i].Quantity)
		total += transaction.Details[i].Subtotal
	}
	transaction.Total = total

	// --- Simpan transaksi sekaligus detail (GORM otomatis handle slice) ---
	if err := tx.Create(&transaction).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// --- Kurangi stok ingredient ---
	for i := range transaction.Details {
		var ingredients []models.ProductIngredient
		tx.Where("product_id = ?", transaction.Details[i].ProductID).Find(&ingredients)

		for _, ing := range ingredients {
			var stock models.IngredientStock
			tx.Where("ingredient_id = ?", ing.IngredientID).First(&stock)

			requiredQty := ing.Quantity * float64(transaction.Details[i].Quantity)

			if stock.Quantity < requiredQty {
				tx.Rollback()
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "stok bahan baku tidak cukup",
				})
			}

			stock.Quantity -= requiredQty
			if err := tx.Save(&stock).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "gagal update stok ingredient",
				})
			}
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




func GetAllTransactions(c *fiber.Ctx) error {
	transactions, err := repositories.GetAllTransactions()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"message": "success",
		"data":    transactions,
	})
}

func GetTransactionByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid transaction id",
		})
	}

	transaction, err := repositories.GetTransactionByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "success",
		"data":    transaction,
	})
}
