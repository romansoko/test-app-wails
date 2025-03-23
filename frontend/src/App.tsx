/// <reference types="react" />
// @ts-ignore
import React, { useState, useEffect } from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { GetCurrentTime, GetProducts, GetOrders, GetStockItems, DatabaseStatus } from '../wailsjs/go/main/App';
import { main } from '../wailsjs/go/models';

// Components
import SidebarLayout from './layouts/SidebarLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import NotificationSystem from './components/NotificationSystem';
import Stock from './pages/Stock';

// Interfaces
type Product = main.Product;

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

function App() {
  // App state
  const [currentTime, setCurrentTime] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [dbStatus, setDbStatus] = useState('Checking database...');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      GetCurrentTime().then(setCurrentTime);
    }, 1000);
    
    // Load initial data
    loadInitialData();
    
    // Check database status
    DatabaseStatus().then(setDbStatus).catch(err => {
      console.error("Failed to get database status:", err);
      setDbStatus("Database error: Could not connect");
    });
    
    return () => clearInterval(interval);
  }, []);
  
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadProducts(), loadOrders(), loadStockItems()]);
    } catch (error) {
      showNotification({ message: "Failed to load data. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadProducts = async () => {
    try {
      console.log("Loading products...");
      const productList = await GetProducts();
      console.log("Products loaded:", productList);
      setProducts(productList);
      return productList;
    } catch (error) {
      console.error("Failed to load products:", error);
      throw error;
    }
  };
  
  const loadOrders = async () => {
    try {
      const orderList = await GetOrders();
      setOrders(orderList || []);
      return orderList;
    } catch (error) {
      console.error("Failed to load orders:", error);
      throw error;
    }
  };
  
  const loadStockItems = async () => {
    try {
      const stockItemsList = await GetStockItems();
      setStockItems(stockItemsList || []);
      return stockItemsList;
    } catch (error) {
      console.error("Failed to load stock items:", error);
      throw error;
    }
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const showNotification = (options: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => {
    const newNotification: Notification = {
      id: uuidv4(),
      message: options.message,
      type: options.type,
      duration: 3000
    };
    
    setNotifications(current => [...current, newNotification]);
  };
  
  const removeNotification = (id: string) => {
    setNotifications(current => current.filter(notification => notification.id !== id));
  };
  
  // Calculate stats for dashboard
  const pendingOrderCount = orders.filter(order => order.status === 'Pending').length;
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Render the appropriate page based on activePage state
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            productCount={products.length}
            orderCount={orders.length}
            stockItemCount={stockItems.length}
            pendingOrderCount={pendingOrderCount}
            totalSales={totalSales}
            darkMode={darkMode}
          />
        );
      case 'products':
        return (
          <Products 
            products={products}
            darkMode={darkMode}
            onProductsChanged={loadProducts}
            showNotification={showNotification}
          />
        );
      case 'create-order':
        return (
          <CreateOrder 
            products={products}
            darkMode={darkMode}
            onOrderCreated={loadOrders}
            showNotification={showNotification}
          />
        );
      case 'orders':
        return (
          <Orders 
            darkMode={darkMode}
            showNotification={showNotification}
          />
        );
      case 'stock':
        return (
          <Stock
            darkMode={darkMode}
            showNotification={showNotification}
          />
        );
      default:
        return <div>Page not found</div>;
    }
  };
  
  return (
    <div className={darkMode ? 'dark-mode' : 'light-mode'}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loader"></div>
        </div>
      )}
      
      <SidebarLayout
        currentTime={currentTime}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        dbStatus={dbStatus}
        activePage={activePage}
        setActivePage={setActivePage}
      >
        {renderPage()}
      </SidebarLayout>
      
      <NotificationSystem 
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </div>
  );
}

export default App;
