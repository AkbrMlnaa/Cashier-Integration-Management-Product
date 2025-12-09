package models

import "time"

type PaymentMethod string

const (
	PaymentCash PaymentMethod = "cash"
	PaymentQris PaymentMethod = "qris"
)

type Transaction struct {
	ID            uint           `gorm:"primaryKey;autoIncrement" json:"id,omitempty"`
	UserID        *uint          `json:"user_id"`
	Total         float64        `gorm:"type:numeric(12,2);not null;check:total>=0" json:"total"`
	PaymentMethod PaymentMethod  `gorm:"type:varchar(10);not null" json:"payment_method"`
	CreatedAt     time.Time      `gorm:"autoCreateTime" json:"created_at"`

	User     *User               `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Details  []TransactionDetail `gorm:"foreignKey:TransactionID" json:"details,omitempty"`
}
