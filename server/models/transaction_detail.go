package models

type TransactionDetail struct {
	ID             uint      `gorm:"primaryKey;autoIncrement" json:"-"`
	TransactionID  uint      `json:"transaction_id"`
	ProductID      *uint     `json:"product_id"`
	Quantity       int       `gorm:"not null;check:quantity>0" json:"quantity"`
	Price          float64   `gorm:"type:numeric(12,2);not null;check:price>0" json:"price"`
	Subtotal       float64   `gorm:"type:numeric(12,2)" json:"subtotal"`

	Product        *Product      `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Transaction    *Transaction  `gorm:"foreignKey:TransactionID" json:"transaction,omitempty"`
}
