package models

import "time"

type Ingredient struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:150;not null" json:"name"`
	Unit      string    `gorm:"size:50;not null" json:"unit"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	
	Stock IngredientStock `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	ProductRefs []ProductIngredient `gorm:"foreignKey:IngredientID" json:"product_refs,omitempty"`
}
