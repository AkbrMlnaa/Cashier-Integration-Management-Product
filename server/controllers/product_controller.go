package controllers

import (
	"net/http"
	"server/models"
	"server/repositories"
	"server/utils"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func AddProduct(c *fiber.Ctx) error {
	name := c.FormValue("name")
	category := c.FormValue("category")
	price, _ := strconv.ParseFloat(c.FormValue("price"), 64)
	stock, _ := strconv.Atoi(c.FormValue("stock"))

	if name == "" || category == "" || price <= 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "name, category, dan price wajib diisi",
		})
	}

	if category != "Makanan" && category != "Minuman" {
		return c.Status(400).JSON(fiber.Map{
			"error": "category harus Makanan atau Minuman",
		})
	}

	var imageUrl string
	var imageID string

	file, err := c.FormFile("image")
	if err == nil {
		f, _ := file.Open()
		defer f.Close()

		url, publicID, err := utils.UploadToCloudinary(f, file)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "Upload ke cloudinary gagal",
			})
		}

		imageUrl = url
		imageID = publicID
	}

	product := models.Product{
		Name:           name,
		Category:       category,
		Price:          price,
		Stock:          stock,
		ImageURL:       imageUrl,
		ImagePublicID:  imageID,
	}

	if err := repositories.AddProduct(&product); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	data, _ := repositories.GetProductByID(product.ID)

	return c.Status(201).JSON(fiber.Map{
		"status":  "success",
		"message": "Product berhasil ditambahkan",
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
	id, _ := strconv.Atoi(c.Params("id"))

	product, err := repositories.GetProductByID(uint(id))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "product tidak ditemukan"})
	}

	if name := c.FormValue("name"); name != "" {
		product.Name = name
	}

	if category := c.FormValue("category"); category != "" {
		if category != "Makanan" && category != "Minuman" {
			return c.Status(400).JSON(fiber.Map{
				"error": "category harus Makanan atau Minuman",
			})
		}
		product.Category = category
	}

	if priceStr := c.FormValue("price"); priceStr != "" {
		price, _ := strconv.ParseFloat(priceStr, 64)
		if price > 0 {
			product.Price = price
		}
	}

	file, err := c.FormFile("image")
	if err == nil {

		// Hapus dulu gambar lama
		if product.ImagePublicID != "" {
			utils.DeleteFromCloudinary(product.ImagePublicID)
		}

		f, _ := file.Open()
		defer f.Close()

		url, publicID, err := utils.UploadToCloudinary(f, file)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "upload gagal"})
		}

		product.ImageURL = url
		product.ImagePublicID = publicID
	}

	if err := repositories.UpdateProduct(&product); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	updated, _ := repositories.GetProductByID(uint(id))

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Product berhasil diupdate",
		"data":    updated,
	})
}



func DeleteProduct(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))

	product, err := repositories.GetProductByID(uint(id))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "product tidak ditemukan"})
	}

	if product.ImagePublicID != "" {
		utils.DeleteFromCloudinary(product.ImagePublicID)
	}

	if err := repositories.DeleteProduct(uint(id)); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
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
