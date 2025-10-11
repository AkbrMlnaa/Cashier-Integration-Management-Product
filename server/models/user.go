package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Email     string    `gorm:"size:100;unique;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	Role      string    `gorm:"size:20;not null;check:role IN ('admin','cashier')" json:"role"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	Transactions []Transaction `gorm:"foreignKey:UserID" json:"transactions,omitempty"`
}
