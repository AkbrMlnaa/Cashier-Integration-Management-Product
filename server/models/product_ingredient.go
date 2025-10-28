package models

type ProductIngredient struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ProductID    uint      `json:"product_id"`
	IngredientID uint      `json:"ingredient_id"`
	Quantity     float64   `gorm:"type:numeric(12,2);not null;check:quantity>0" json:"quantity"`

	Product     Product     `gorm:"foreignKey:ProductID" json:"-"`
	Ingredient  Ingredient  `gorm:"foreignKey:IngredientID" json:"ingredient,omitempty"`
}
