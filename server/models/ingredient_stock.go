package models

import "time"

type IngredientStock struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	IngredientID uint      `json:"ingredient_id"`
	Quantity     float64   `gorm:"type:numeric(12,2);not null;check:quantity>=0" json:"quantity"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`

	Ingredient *Ingredient `gorm:"foreignKey:IngredientID" json:"ingredient,omitempty"`
}
