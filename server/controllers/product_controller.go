package controllers

import (
	"net/http"
	"server/models"
	"server/repositories"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func AddProduct(c *fiber.Ctx) error {
	var product models.Product
	if err := c.BodyParser(&product); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	if err := repositories.AddProduct(&product); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	data, _ := repositories.GetProductByID(product.ID)
	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"data":    data,
		"message": "berhasil menambahkan product",
	})

}

func GetAllProducts(c *fiber.Ctx) error {
	products, err := repositories.GetAllProducts()

	if err != nil {
		c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(products)
}

func GetProductByID(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))

	product, err := repositories.GetProductByID(uint(id))
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(product)
}

func UpdateProduct(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))

	var req models.Product
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	product, err := repositories.GetProductByID(uint(id))
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "product tidak ditemukan",
		})
	}

	if req.Category != "" {
		if req.Category != "Makanan" && req.Category != "Minuman" {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"error": "Category harus 'Makanan' atau 'Minuman'",
			})
		}
		product.Category = req.Category
	}

	if req.Name != "" {
		product.Name = req.Name
	}
	if req.Category != "" {
		product.Category = req.Category
	}
	if req.Price != 0 {
		product.Price = req.Price
	}

	product.IsAvailable = req.IsAvailable

	if err := repositories.UpdateProduct(&product); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	data, _ := repositories.GetProductByID(product.ID)
	return c.JSON(fiber.Map{
		"data":    data,
		"message": "berhasil update product",
	})
}

func DeleteProduct(c *fiber.Ctx) error {
	id, _ := strconv.Atoi("id")

	if err := repositories.DeleteProduct(uint(id)); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"message": "berhasil menghapus product",
	})
}

func UpsertProductIngredients(c *fiber.Ctx) error {
	productID, _ := strconv.Atoi(c.Params("id"))

	var body struct {
		Ingredients []struct {
			IngredientID uint    `json:"ingredient_id"`
			Quantity     float64 `json:"quantity"`
		} `json:"ingredients"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}


	var newIngredients []models.ProductIngredient
	for _, item := range body.Ingredients {
		if item.Quantity <= 0 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"error": "Quantity harus > 0",
			})
		}
		

		newIngredients = append(newIngredients, models.ProductIngredient{
			ProductID:    uint(productID),
			IngredientID: item.IngredientID,
			Quantity:     item.Quantity,
		})
	}
	

	if err := repositories.UpsertProductIngredients(uint(productID), newIngredients); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	data, _ := repositories.GetProductByID(uint(productID))

	return c.JSON(fiber.Map{
		"data":    data,
		"message": "Product ingredient berhasil diupdate",
	})
}


// // ✅ Controller: Upsert Product Ingredients
// func UpsertProductIngredients(c *fiber.Ctx) error {
// 	productID, err := strconv.Atoi(c.Params("product_id"))
// 	if err != nil {
// 		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
// 			"error": "product_id tidak valid",
// 		})
// 	}

// 	// pastikan produk ada
// 	var product models.Product
// 	if err := database.DB.First(&product, productID).Error; err != nil {
// 		return c.Status(http.StatusNotFound).JSON(fiber.Map{
// 			"error": fmt.Sprintf("product id %d tidak ditemukan", productID),
// 		})
// 	}

// 	// ambil body request
// 	var body struct {
// 		Ingredients []struct {
// 			IngredientID uint    `json:"ingredient_id"`
// 			Quantity     float64 `json:"quantity"`
// 		} `json:"ingredients"`
// 	}
// 	if err := c.BodyParser(&body); err != nil {
// 		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
// 			"error": "invalid input: " + err.Error(),
// 		})
// 	}

// 	if len(body.Ingredients) == 0 {
// 		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
// 			"error": "data ingredients kosong",
// 		})
// 	}

// 	// validasi ingredients dan siapkan data
// 	var newIngredients []models.ProductIngredient
// 	for _, item := range body.Ingredients {
// 		if item.Quantity <= 0 {
// 			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
// 				"error": fmt.Sprintf("quantity untuk ingredient id %d harus > 0", item.IngredientID),
// 			})
// 		}

// 		// cek ingredient valid
// 		var ing models.Ingredient
// 		if err := database.DB.First(&ing, item.IngredientID).Error; err != nil {
// 			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
// 				"error": fmt.Sprintf("ingredient id %d tidak ditemukan", item.IngredientID),
// 			})
// 		}

// 		// siapkan untuk insert/update
// 		pi := models.ProductIngredient{
// 			ProductID:    uint(productID),
// 			IngredientID: item.IngredientID,
// 			Quantity:     item.Quantity,
// 		}

// 		log.Printf("[DEBUG] Upsert ingredient: product_id=%d, ingredient_id=%d, quantity=%f",
// 			pi.ProductID, pi.IngredientID, pi.Quantity)

// 		newIngredients = append(newIngredients, pi)
// 	}

// 	// simpan ke repository
// 	if err := repositories.UpsertProductIngredients(uint(productID), newIngredients); err != nil {
// 		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
// 			"error": err.Error(),
// 		})
// 	}

// 	data, _ := repositories.GetProductByID(uint(productID))
// 	return c.JSON(fiber.Map{
// 		"message": "product ingredient berhasil diupdate",
// 		"data":    data,
// 	})
// }
