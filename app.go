package main

import (
	"context"
	"log"
	"strconv"
	"time"
)

// Product represents a product in our system
type Product struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
	Status      string  `json:"status"`
}

// OrderItem represents a product in an order with quantity
type OrderItem struct {
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
}

// Order represents a customer order
type Order struct {
	ID          string      `json:"id"`
	Date        string      `json:"date"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Items       []OrderItem `json:"items"`
	Total       float64     `json:"total"`
	Status      string      `json:"status"`
}

// StockItem represents an item in the inventory
type StockItem struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Quantity    float64 `json:"quantity"`
}

// App struct
type App struct {
	ctx context.Context
	db  *Database
}

// NewApp creates a new App application struct
func NewApp() *App {
	// Initialize the database
	db, err := NewDatabase()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	return &App{
		db: db,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// shutdown is called when the app is closing
func (a *App) shutdown(ctx context.Context) {
	// Close the database connection
	if a.db != nil {
		if err := a.db.Close(); err != nil {
			log.Printf("Error closing database: %v", err)
		}
	}
}

// GetCurrentTime returns the current time
func (a *App) GetCurrentTime() string {
	return time.Now().Format(time.RFC1123)
}

// DatabaseStatus returns the status of the database connection
func (a *App) DatabaseStatus() string {
	if a.db == nil {
		return "Database not initialized"
	}

	// Test the database connection by getting the count of products
	products, err := a.db.GetProducts()
	if err != nil {
		return "Database error: " + err.Error()
	}

	return "Database connected, product count: " + strconv.Itoa(len(products))
}

// GetProducts returns all products
func (a *App) GetProducts() []Product {
	products, err := a.db.GetProducts()
	if err != nil {
		log.Printf("Error getting products: %v", err)
		return []Product{}
	}
	return products
}

// AddProduct adds a new product
func (a *App) AddProduct(product Product) bool {
	_, err := a.db.AddProduct(product)
	if err != nil {
		log.Printf("Error adding product: %v", err)
		return false
	}
	return true
}

// UpdateProduct updates an existing product
func (a *App) UpdateProduct(updatedProduct Product) bool {
	err := a.db.UpdateProduct(updatedProduct)
	if err != nil {
		log.Printf("Error updating product: %v", err)
		return false
	}
	return true
}

// DeleteProduct removes a product by ID
func (a *App) DeleteProduct(id string) bool {
	log.Printf("DeleteProduct called with ID: %s", id)
	err := a.db.DeleteProduct(id)
	if err != nil {
		log.Printf("Error deleting product: %v", err)
		return false
	}
	log.Printf("Product with ID %s deleted successfully", id)
	return true
}

// GetOrders returns all orders
func (a *App) GetOrders() []Order {
	orders, err := a.db.GetOrders()
	if err != nil {
		log.Printf("Error getting orders: %v", err)
		return []Order{}
	}
	return orders
}

// GetProductByID returns a product by its ID
func (a *App) GetProductByID(id string) *Product {
	products, err := a.db.GetProducts()
	if err != nil {
		log.Printf("Error getting products: %v", err)
		return nil
	}

	for _, product := range products {
		if product.ID == id {
			return &product
		}
	}
	return nil
}

// CreateOrder creates a new order with the given items
func (a *App) CreateOrder(order struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Items       []OrderItem `json:"items"`
}) bool {
	if len(order.Items) == 0 {
		log.Println("Cannot create an order with no items")
		return false
	}

	if order.Name == "" {
		log.Println("Cannot create an order without a name")
		return false
	}

	_, err := a.db.CreateOrder(order.Name, order.Description, order.Items)
	if err != nil {
		log.Printf("Error creating order: %v", err)
		return false
	}
	return true
}

// UpdateOrderStatus updates the status of an order
func (a *App) UpdateOrderStatus(orderID string, status string) bool {
	err := a.db.UpdateOrderStatus(orderID, status)
	if err != nil {
		log.Printf("Error updating order status: %v", err)
		return false
	}
	return true
}

// DeleteOrder removes an order by ID
func (a *App) DeleteOrder(id string) bool {
	log.Printf("DeleteOrder called with ID: %s", id)
	err := a.db.DeleteOrder(id)
	if err != nil {
		log.Printf("Error deleting order: %v", err)
		return false
	}
	log.Printf("Order with ID %s deleted successfully", id)
	return true
}

// GetStockItems retrieves all stock items from the database
func (a *App) GetStockItems() []StockItem {
	items, err := a.db.GetStockItems()
	if err != nil {
		log.Printf("Error getting stock items: %v", err)
		return []StockItem{}
	}
	return items
}

// AddStockItem adds a new stock item to the database
func (a *App) AddStockItem(item StockItem) StockItem {
	savedItem, err := a.db.AddStockItem(item)
	if err != nil {
		log.Printf("Error adding stock item: %v", err)
		return StockItem{}
	}
	return savedItem
}

// UpdateStockItem updates an existing stock item
func (a *App) UpdateStockItem(item StockItem) bool {
	success, err := a.db.UpdateStockItem(item)
	if err != nil {
		log.Printf("Error updating stock item: %v", err)
		return false
	}
	return success
}

// DeleteStockItem removes a stock item by ID
func (a *App) DeleteStockItem(id string) bool {
	success, err := a.db.DeleteStockItem(id)
	if err != nil {
		log.Printf("Error deleting stock item: %v", err)
		return false
	}
	log.Printf("Stock item with ID %s deleted successfully", id)
	return success
}
