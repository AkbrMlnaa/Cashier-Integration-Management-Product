package controllers

import (
	"net/http"
	"server/models"
	"server/repositories"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func AddIngredient(c *fiber.Ctx) error {
	var ingredient models.Ingredient
	if err := c.BodyParser(&ingredient); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if err := repositories.AddIngredient(&ingredient); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	if err := repositories.CreateInitialStock(ingredient.ID); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	saved, _ := repositories.GetIngredientByID(ingredient.ID)

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "berhasil menambahkan ingredient",
		"data":    saved,
	})
}

func GetAllIngredients(c *fiber.Ctx) error {
	data, err := repositories.GetAllIngredients()

	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"message": "berhasil mengambil semua ingredient",
		"data":   data,
	})
}

func GetIngredientByID(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))

	data, err := repositories.GetIngredientByID(uint(id))

	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"message": "berhasil mengambil ingredient",
		"data":   data,
	})
}

func UpdateIngredient(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var req models.Ingredient
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	ingredient, err := repositories.GetIngredientByID(uint(id))
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "Ingredient tidak ditemukan",
		})
	}

	if req.Name != "" {
		ingredient.Name = req.Name
	}

	if req.Unit != "" {
		ingredient.Unit = req.Unit
	}
	if err := repositories.UpdateIngredient(&ingredient); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	dataUpdate, _ := repositories.GetIngredientByID(uint(id))
	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "berhasil mengupdate ingredient",
		"data":    dataUpdate,
	})
}

func UpdateIngredientStock(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))

	var req struct {
		Quantity float64 `json:"quantity"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	stock, err := repositories.UpdateStockQuantity(uint(id), req.Quantity)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "stock berhasil di update",
		"data":    stock,
	})
}

func DeleteIngredient(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	if err := repositories.DeleteIngredient(uint(id)); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "ingredient berhasil dihapus",
	})
}
