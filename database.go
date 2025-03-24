package main

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

// Database represents our SQLite database connection
type Database struct {
	db *sql.DB
}

// NewDatabase initializes and returns a new Database instance
func NewDatabase() (*Database, error) {
	// Get the database file path in a cross-platform way
	dbPath := getDBPath()

	// Ensure the directory exists
	dbDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %v", err)
	}

	// Open the database connection
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	// Create the database instance
	database := &Database{db: db}

	// Initialize the database tables
	if err := database.initialize(); err != nil {
		db.Close()
		return nil, err
	}

	return database, nil
}

// getDBPath returns the platform-specific SQLite database file path
func getDBPath() string {
	var appDataDir string

	switch runtime.GOOS {
	case "windows":
		// For Windows - use %APPDATA%
		appDataDir = os.Getenv("APPDATA")
		if appDataDir == "" {
			// Fallback if %APPDATA% is not available
			appDataDir = filepath.Join(os.Getenv("USERPROFILE"), "AppData", "Roaming")
		}
	case "darwin":
		// For macOS - use ~/Library/Application Support
		appDataDir = filepath.Join(os.Getenv("HOME"), "Library", "Application Support")
	default:
		// For Linux and others - use ~/.local/share
		appDataDir = filepath.Join(os.Getenv("HOME"), ".local", "share")
	}

	// Create application-specific folder
	dbDir := filepath.Join(appDataDir, "GardenProductManager")
	dbPath := filepath.Join(dbDir, "garden_db.sqlite")

	// Print the path for debugging
	fmt.Printf("Database path: %s\n", dbPath)

	return dbPath
}

// initialize creates database tables if they don't exist
func (db *Database) initialize() error {
	// Create products table
	_, err := db.db.Exec(`CREATE TABLE IF NOT EXISTS products (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		price REAL NOT NULL,
		image TEXT,
		description TEXT,
		category TEXT
	)`)
	if err != nil {
		return fmt.Errorf("failed to create products table: %v", err)
	}

	// Check if status column exists in products table, add it if not
	var hasStatusColumn bool
	err = db.db.QueryRow(`SELECT COUNT(*) FROM pragma_table_info('products') WHERE name='status'`).Scan(&hasStatusColumn)
	if err != nil {
		return fmt.Errorf("failed to check if status column exists: %v", err)
	}

	if !hasStatusColumn {
		fmt.Println("Status column does not exist in products table, adding it...")
		_, err = db.db.Exec(`ALTER TABLE products ADD COLUMN status TEXT`)
		if err != nil {
			return fmt.Errorf("failed to add status column to products table: %v", err)
		}
		fmt.Println("Status column added successfully")

		// Set default status for existing products
		_, err = db.db.Exec(`UPDATE products SET status = 'In Stock' WHERE status IS NULL`)
		if err != nil {
			return fmt.Errorf("failed to set default status for existing products: %v", err)
		}
		fmt.Println("Default status set for existing products")
	}

	// Create orders table
	_, err = db.db.Exec(`CREATE TABLE IF NOT EXISTS orders (
		id TEXT PRIMARY KEY,
		date TEXT NOT NULL,
		name TEXT,
		description TEXT,
		status TEXT NOT NULL,
		total REAL NOT NULL
	)`)
	if err != nil {
		return fmt.Errorf("failed to create orders table: %v", err)
	}

	// Create order_items table with a foreign key to orders
	_, err = db.db.Exec(`CREATE TABLE IF NOT EXISTS order_items (
		id TEXT PRIMARY KEY,
		order_id TEXT NOT NULL,
		product_id TEXT NOT NULL,
		name TEXT NOT NULL,
		price REAL NOT NULL,
		quantity INTEGER NOT NULL,
		FOREIGN KEY (order_id) REFERENCES orders(id)
	)`)
	if err != nil {
		return fmt.Errorf("failed to create order_items table: %v", err)
	}

	// Check if products table is empty and populate with sample data if needed
	var count int
	err = db.db.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to count products: %v", err)
	}

	if count == 0 {
		// Add sample products
		sampleProducts := []Product{
			{ID: "1", Name: "Tomato Plant", Price: 5.99, Description: "Organic tomato seedling, ready to plant", Status: "In Stock"},
			{ID: "2", Name: "Garden Soil", Price: 12.99, Description: "Premium organic soil mix for vegetables", Status: "In Stock"},
			{ID: "3", Name: "Watering Can", Price: 9.99, Description: "Durable plastic 2-gallon watering can", Status: "In Stock"},
		}

		for _, product := range sampleProducts {
			_, err := db.db.Exec(
				"INSERT INTO products (id, name, price, description, status) VALUES (?, ?, ?, ?, ?)",
				product.ID, product.Name, product.Price, product.Description, product.Status,
			)
			if err != nil {
				return fmt.Errorf("failed to insert sample product: %v", err)
			}
		}
	}

	// Check if the name and description columns exist in the orders table, add them if they don't
	var nameExists, descriptionExists int
	err = db.db.QueryRow("SELECT COUNT(*) FROM pragma_table_info('orders') WHERE name='name'").Scan(&nameExists)
	if err != nil {
		return fmt.Errorf("failed to check if name column exists: %v", err)
	}

	err = db.db.QueryRow("SELECT COUNT(*) FROM pragma_table_info('orders') WHERE name='description'").Scan(&descriptionExists)
	if err != nil {
		return fmt.Errorf("failed to check if description column exists: %v", err)
	}

	if nameExists == 0 {
		_, err = db.db.Exec("ALTER TABLE orders ADD COLUMN name TEXT DEFAULT 'Order'")
		if err != nil {
			return fmt.Errorf("failed to add name column: %v", err)
		}
	}

	if descriptionExists == 0 {
		_, err = db.db.Exec("ALTER TABLE orders ADD COLUMN description TEXT")
		if err != nil {
			return fmt.Errorf("failed to add description column: %v", err)
		}
	}

	// Create stock_items table if it doesn't exist
	_, err = db.db.Exec(`CREATE TABLE IF NOT EXISTS stock_items (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		description TEXT,
		quantity REAL NOT NULL
	)`)
	if err != nil {
		return fmt.Errorf("failed to create stock_items table: %v", err)
	}

	return nil
}

// Close closes the database connection
func (db *Database) Close() error {
	return db.db.Close()
}

// GetProducts retrieves all products from the database
func (db *Database) GetProducts() ([]Product, error) {
	rows, err := db.db.Query("SELECT id, name, price, description, status FROM products")
	if err != nil {
		return nil, fmt.Errorf("failed to query products: %v", err)
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var product Product
		var status sql.NullString // Use sql.NullString to handle NULL values

		if err := rows.Scan(&product.ID, &product.Name, &product.Price, &product.Description, &status); err != nil {
			return nil, fmt.Errorf("failed to scan product: %v", err)
		}

		// Set default status if NULL
		if status.Valid {
			product.Status = status.String
		} else {
			product.Status = "In Stock" // Default value
		}

		products = append(products, product)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating products: %v", err)
	}

	return products, nil
}

// AddProduct adds a new product to the database
func (db *Database) AddProduct(product Product) (string, error) {
	// Generate a UUID if not provided
	if product.ID == "" {
		product.ID = uuid.New().String()
	}

	// Insert the product
	_, err := db.db.Exec(
		"INSERT INTO products (id, name, price, description, status) VALUES (?, ?, ?, ?, ?)",
		product.ID, product.Name, product.Price, product.Description, product.Status,
	)
	if err != nil {
		return "", fmt.Errorf("failed to insert product: %v", err)
	}

	return product.ID, nil
}

// UpdateProduct updates an existing product in the database
func (db *Database) UpdateProduct(product Product) error {
	_, err := db.db.Exec(
		"UPDATE products SET name = ?, price = ?, description = ?, status = ? WHERE id = ?",
		product.Name, product.Price, product.Description, product.Status, product.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update product: %v", err)
	}
	return nil
}

// DeleteProduct removes a product from the database
func (db *Database) DeleteProduct(id string) error {
	fmt.Printf("DB: Attempting to delete product with ID: %s\n", id)

	// Enable foreign key constraints
	_, err := db.db.Exec("PRAGMA foreign_keys = ON")
	if err != nil {
		fmt.Printf("DB: Error enabling foreign keys: %v\n", err)
	}

	// Try to parse the ID as an integer
	fmt.Printf("DB: Exact SQL query: DELETE FROM products WHERE id = '%s'\n", id)

	// Execute the delete operation with prepared statement to avoid SQL injection
	stmt, err := db.db.Prepare("DELETE FROM products WHERE id = ?")
	if err != nil {
		fmt.Printf("DB: Error preparing statement: %v\n", err)
		return fmt.Errorf("failed to prepare delete statement: %v", err)
	}
	defer stmt.Close()

	result, err := stmt.Exec(id)
	if err != nil {
		fmt.Printf("DB: Error executing delete query: %v\n", err)
		return fmt.Errorf("failed to delete product: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		fmt.Printf("DB: Error getting rows affected: %v\n", err)
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	fmt.Printf("DB: Delete operation completed. Rows affected: %d\n", rowsAffected)
	if rowsAffected == 0 {
		fmt.Printf("DB: No product found with ID: %s\n", id)
		return fmt.Errorf("no product found with ID: %s", id)
	}

	return nil
}

// GetOrders retrieves all orders with their items from the database
func (db *Database) GetOrders() ([]Order, error) {
	// Query all orders
	rows, err := db.db.Query("SELECT id, date, name, description, total, status FROM orders")
	if err != nil {
		return nil, fmt.Errorf("failed to query orders: %v", err)
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var order Order
		var description sql.NullString // Use NullString to handle NULL values
		var name sql.NullString        // Use NullString to handle NULL values

		if err := rows.Scan(&order.ID, &order.Date, &name, &description, &order.Total, &order.Status); err != nil {
			return nil, fmt.Errorf("failed to scan order: %v", err)
		}

		// Set default values if NULL
		if name.Valid {
			order.Name = name.String
		} else {
			order.Name = "Order #" + order.ID // Default name
		}

		if description.Valid {
			order.Description = description.String
		} else {
			order.Description = ""
		}

		// Get items for this order
		itemRows, err := db.db.Query(
			"SELECT product_id, name, price, quantity FROM order_items WHERE order_id = ?",
			order.ID,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to query order items: %v", err)
		}
		defer itemRows.Close()

		var items []OrderItem
		for itemRows.Next() {
			var item OrderItem
			if err := itemRows.Scan(&item.ProductID, &item.ProductName, &item.Price, &item.Quantity); err != nil {
				return nil, fmt.Errorf("failed to scan order item: %v", err)
			}
			items = append(items, item)
		}

		if err := itemRows.Err(); err != nil {
			return nil, fmt.Errorf("error iterating order items: %v", err)
		}

		order.Items = items
		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating orders: %v", err)
	}

	return orders, nil
}

// CreateOrder creates a new order with its items in the database
func (db *Database) CreateOrder(name string, description string, items []OrderItem) (string, error) {
	// Start a transaction
	tx, err := db.db.Begin()
	if err != nil {
		return "", fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Calculate the total amount
	var total float64
	for _, item := range items {
		total += item.Price * float64(item.Quantity)
	}

	// Get the next order ID
	var maxID int
	err = tx.QueryRow("SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) FROM orders").Scan(&maxID)
	if err != nil {
		return "", fmt.Errorf("failed to get max order ID: %v", err)
	}

	orderID := strconv.Itoa(maxID + 1)
	date := fmt.Sprintf("%s", strings.Replace(strings.Split(fmt.Sprint(GetFormattedDate()), "+")[0], "T", " ", -1))

	fmt.Printf("Creating order: ID=%s, Name=%s, Total=%.2f\n", orderID, name, total)

	// Create the order
	_, err = tx.Exec(
		"INSERT INTO orders (id, date, name, description, total, status) VALUES (?, ?, ?, ?, ?, ?)",
		orderID, date, name, description, total, "Pending",
	)
	if err != nil {
		fmt.Printf("Error inserting order: %v\n", err)
		return "", fmt.Errorf("failed to insert order: %v", err)
	}
	fmt.Printf("Order record created successfully\n")

	// Insert the order items
	for i, item := range items {
		// Generate a unique ID for each order item
		itemID := uuid.New().String()

		fmt.Printf("Inserting order item %d: ID=%s, ProductID=%s, Name=%s, Price=%.2f, Quantity=%d\n",
			i+1, itemID, item.ProductID, item.ProductName, item.Price, item.Quantity)

		_, err = tx.Exec(
			"INSERT INTO order_items (id, order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)",
			itemID, orderID, item.ProductID, item.ProductName, item.Price, item.Quantity,
		)
		if err != nil {
			fmt.Printf("Error inserting order item: %v\n", err)
			return "", fmt.Errorf("failed to insert order item: %v", err)
		}
	}
	fmt.Printf("All order items inserted successfully\n")

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		fmt.Printf("Error committing transaction: %v\n", err)
		return "", fmt.Errorf("failed to commit transaction: %v", err)
	}

	fmt.Printf("Order %s created successfully with %d items\n", orderID, len(items))
	return orderID, nil
}

// UpdateOrderStatus updates the status of an order in the database
func (db *Database) UpdateOrderStatus(orderID string, status string) error {
	_, err := db.db.Exec("UPDATE orders SET status = ? WHERE id = ?", status, orderID)
	if err != nil {
		return fmt.Errorf("failed to update order status: %v", err)
	}
	return nil
}

// DeleteOrder removes an order and its items from the database
func (db *Database) DeleteOrder(id string) error {
	fmt.Printf("DB: Attempting to delete order with ID: %s\n", id)

	// Enable foreign key constraints
	_, err := db.db.Exec("PRAGMA foreign_keys = ON")
	if err != nil {
		fmt.Printf("DB: Error enabling foreign keys: %v\n", err)
	}

	// Start a transaction
	tx, err := db.db.Begin()
	if err != nil {
		fmt.Printf("DB: Error beginning transaction: %v\n", err)
		return fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer func() {
		if err != nil {
			fmt.Printf("DB: Rolling back transaction due to error\n")
			tx.Rollback()
		}
	}()

	// Delete the order items first
	fmt.Printf("DB: Deleting order items for order: %s\n", id)
	result, err := tx.Exec("DELETE FROM order_items WHERE order_id = ?", id)
	if err != nil {
		fmt.Printf("DB: Error deleting order items: %v\n", err)
		return fmt.Errorf("failed to delete order items: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	fmt.Printf("DB: %d order items deleted\n", rowsAffected)

	// Delete the order
	fmt.Printf("DB: Deleting order: %s\n", id)
	result, err = tx.Exec("DELETE FROM orders WHERE id = ?", id)
	if err != nil {
		fmt.Printf("DB: Error deleting order: %v\n", err)
		return fmt.Errorf("failed to delete order: %v", err)
	}

	rowsAffected, err = result.RowsAffected()
	if err != nil {
		fmt.Printf("DB: Error getting rows affected: %v\n", err)
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	fmt.Printf("DB: Delete operation completed. Rows affected: %d\n", rowsAffected)
	if rowsAffected == 0 {
		fmt.Printf("DB: No order found with ID: %s\n", id)
		return fmt.Errorf("no order found with ID: %s", id)
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		fmt.Printf("DB: Error committing transaction: %v\n", err)
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	fmt.Printf("DB: Order %s successfully deleted\n", id)
	return nil
}

// GetFormattedDate returns the current time
func GetFormattedDate() string {
	return fmt.Sprintf("%s", strings.Split(fmt.Sprint(fmt.Sprint(time.Now().Format(time.RFC3339))), "+")[0])
}

// GetStockItems retrieves all stock items from the database
func (db *Database) GetStockItems() ([]StockItem, error) {
	rows, err := db.db.Query(`
		SELECT id, name, description, quantity 
		FROM stock_items 
		ORDER BY name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []StockItem
	for rows.Next() {
		var item StockItem
		var description sql.NullString
		err := rows.Scan(&item.ID, &item.Name, &description, &item.Quantity)
		if err != nil {
			return nil, err
		}
		if description.Valid {
			item.Description = description.String
		} else {
			item.Description = ""
		}
		items = append(items, item)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

// AddStockItem adds a new stock item to the database
func (db *Database) AddStockItem(item StockItem) (StockItem, error) {
	// Generate a UUID if not provided
	if item.ID == "" {
		item.ID = uuid.NewString()
	}

	_, err := db.db.Exec(`
		INSERT INTO stock_items (id, name, description, quantity)
		VALUES (?, ?, ?, ?)
	`, item.ID, item.Name, item.Description, item.Quantity)
	if err != nil {
		return StockItem{}, err
	}

	return item, nil
}

// UpdateStockItem updates an existing stock item
func (db *Database) UpdateStockItem(item StockItem) (bool, error) {
	result, err := db.db.Exec(`
		UPDATE stock_items
		SET name = ?, description = ?, quantity = ?
		WHERE id = ?
	`, item.Name, item.Description, item.Quantity, item.ID)
	if err != nil {
		return false, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}

	return rowsAffected > 0, nil
}

// DeleteStockItem removes a stock item by ID
func (db *Database) DeleteStockItem(id string) (bool, error) {
	result, err := db.db.Exec("DELETE FROM stock_items WHERE id = ?", id)
	if err != nil {
		return false, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}

	return rowsAffected > 0, nil
}
