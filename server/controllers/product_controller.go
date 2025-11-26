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
			"error": err.Error(),
		})
	}

	if product.Name == "" || product.Category == "" || product.Price <= 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "name, category, dan price wajib diisi",
		})
	}

	
	if product.Category != "Makanan" && product.Category != "Minuman" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "category harus Makanan atau Minuman",
		})
	}

	if err := repositories.AddProduct(&product); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	data, _ := repositories.GetProductByID(product.ID)

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "product berhasil ditambahkan",
		"data":    data,
	})
}


func GetAllProducts(c *fiber.Ctx) error {
	products, err := repositories.GetAllProducts()

	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"message": "berhasil mengambil semua product",
		"data":   products,
	})
}


func GetProductByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "id tidak valid",
		})
	}

	product, err := repositories.GetProductByID(uint(id))
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "product tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"message": "berhasil mengambil product",
		"data":   product,
	})
}

func UpdateProduct(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "id tidak valid",
		})
	}

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

	if req.Name != "" {
		product.Name = req.Name
	}

	if req.Category != "" {
		if req.Category != "Makanan" && req.Category != "Minuman" {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"error": "category harus Makanan atau Minuman",
			})
		}
		product.Category = req.Category
	}

	if req.Price > 0 {
		product.Price = req.Price
	}

	product.IsAvailable = req.IsAvailable

	if err := repositories.UpdateProduct(&product); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	updated, _ := repositories.GetProductByID(uint(id))

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "product berhasil diupdate",
		"data":    updated,
	})
}


func DeleteProduct(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "id tidak valid",
		})
	}

	if err := repositories.DeleteProduct(uint(id)); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "product berhasil dihapus",
	})
}


func UpsertProductIngredients(c *fiber.Ctx) error {
	productID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "id tidak valid",
		})
	}

	
	if _, err := repositories.GetProductByID(uint(productID)); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "product tidak ditemukan",
		})
	}

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

	if len(body.Ingredients) == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "ingredients tidak boleh kosong",
		})
	}

	var newIngredients []models.ProductIngredient
	for _, item := range body.Ingredients {
		if item.Quantity <= 0 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"error": "quantity harus > 0",
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
		"status":  "success",
		"message": "product ingredient berhasil diupdate",
		"data":    data,
	})
}
