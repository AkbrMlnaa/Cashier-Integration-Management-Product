package repositories

import (
	"server/database"
	"server/models"
)

func GetAllTransactions() ([]models.Transaction, error) {
	var transactions []models.Transaction

	err := database.DB.
		Preload("User").
		Preload("Details").
		Preload("Details.Product").
		Order("created_at DESC").
		Find(&transactions).Error

	if err != nil {
		return nil, err
	}

	return transactions, nil
}

func GetTransactionByID(id uint) (models.Transaction, error) {
	var transaction models.Transaction

	err := database.DB.
		Preload("User").
		Preload("Details").
		Preload("Details.Product").
		First(&transaction, id).Error

	return transaction, err
}

