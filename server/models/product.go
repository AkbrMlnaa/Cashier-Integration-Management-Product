package models

import "time"

type Product struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"size:150;not null" json:"name"`
	Category     string    `gorm:"size:100" json:"category"`
	Price        float64   `gorm:"type:numeric(12,2);not null;check:price>0" json:"price"`
	Stock        int       `gorm:"default:0;check:stock>=0" json:"stock"`
	Image	  string 	`gorm:"size:255" json:"image"`
	IsAvailable  bool      `gorm:"default:true" json:"is_available"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Ingredients []ProductIngredient `gorm:"foreignKey:ProductID" json:"ingredients,omitempty"`
	Details     []TransactionDetail `gorm:"foreignKey:ProductID" json:"details,omitempty"`
}
