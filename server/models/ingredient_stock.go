package models

import "time"

type IngredientStock struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	IngredientID uint      `gorm:"uniqueIndex;not null" json:"ingredient_id"` 
	Quantity     float64   `gorm:"type:numeric(12,2);not null;check:quantity>=0" json:"quantity"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Ingredient *Ingredient `gorm:"foreignKey:IngredientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
}

func (IngredientStock) TableName() string {
    return "public.ingredient_stocks"
}
