import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CreateOrder as CreateOrderAPI } from '../../wailsjs/go/main/App';
import { main } from '../../wailsjs/go/models';
import { formatPrice } from '../utils/formatters';

// Backend types - only import what we use
type Product = main.Product;
type OrderItem = main.OrderItem;

// Define order details interface for frontend use
interface OrderDetails {
  name: string;
  description: string;
  items: OrderItem[];
}

interface CreateOrderProps {
  products: Product[];
  darkMode: boolean;
  onOrderCreated: () => void;
  showNotification: (options: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

// Styled components
const PageContainer = styled.div<{ darkMode: boolean }>`
  padding: 20px;
  min-height: 100vh;
`;

const GlassPanel = styled.div<{ darkMode: boolean }>`
  background: ${props => props.darkMode 
    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))'
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))'};
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 10px 30px ${props => props.darkMode 
    ? 'rgba(0, 0, 0, 0.3)' 
    : 'rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)'};
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  
  &:hover {
    box-shadow: 0 15px 35px ${props => props.darkMode 
      ? 'rgba(0, 0, 0, 0.4)' 
      : 'rgba(0, 0, 0, 0.15)'};
  }
`;

const PageHeader = styled(GlassPanel)`
  padding: 20px 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'};
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`;

const OrderContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const OrderPanel = styled(GlassPanel)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ProductsPanel = styled(GlassPanel)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SectionTitle = styled.h2<{ darkMode: boolean }>`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'};
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 40%;
    height: 3px;
    background: ${props => props.darkMode 
      ? 'var(--color-primary-light)'
      : 'var(--color-primary)'};
    border-radius: 4px;
  }
`;

const OrderSummary = styled.div<{ darkMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-top: 16px;
  margin-bottom: 16px;
  background: ${props => props.darkMode 
    ? 'rgba(15, 23, 42, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'};
  border-radius: 12px;
  box-shadow: 0 4px 8px ${props => props.darkMode 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(0, 0, 0, 0.05)'};
  font-size: 1.2rem;
  
  strong {
    font-size: 1.4rem;
    color: ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.9)' 
      : 'rgba(2, 132, 199, 0.9)'};
    font-weight: 700;
  }
`;

const SearchBox = styled.input<{ darkMode: boolean }>`
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  background: ${props => props.darkMode 
    ? 'rgba(15, 23, 42, 0.5)' 
    : 'rgba(255, 255, 255, 0.95)'};
  color: ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.9)' 
    : 'rgba(0, 0, 0, 0.8)'};
  font-size: 0.95rem;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 300px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.25)' 
      : 'rgba(2, 132, 199, 0.25)'};
    border-color: ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.5)' 
      : 'rgba(2, 132, 199, 0.5)'};
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const Button = styled.button<{ darkMode: boolean; variant?: 'primary' | 'secondary' }>`
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${props => props.variant === 'primary' 
    ? (props.darkMode 
      ? 'linear-gradient(145deg, var(--color-primary), var(--color-primary-dark))'
      : 'linear-gradient(145deg, var(--color-primary-light), var(--color-primary))')
    : (props.darkMode 
      ? 'rgba(51, 65, 85, 0.5)'
      : 'rgba(241, 245, 249, 0.9)')};
  color: ${props => props.variant === 'primary' 
    ? 'white' 
    : (props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)')};
  box-shadow: 0 4px 12px ${props => props.variant === 'primary'
    ? (props.darkMode 
      ? 'rgba(2, 132, 199, 0.3)' 
      : 'rgba(2, 132, 199, 0.2)')
    : 'rgba(0, 0, 0, 0.05)'};
    
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.variant === 'primary'
      ? (props.darkMode 
        ? 'rgba(2, 132, 199, 0.4)' 
        : 'rgba(2, 132, 199, 0.3)')
      : 'rgba(0, 0, 0, 0.08)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
  margin-top: 16px;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
  }
`;

const ProductItem = styled.div<{ darkMode: boolean, selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  background: ${props => {
    if (props.selected) {
      return props.darkMode 
        ? 'rgba(2, 132, 199, 0.2)' 
        : 'rgba(14, 165, 233, 0.1)';
    }
    return props.darkMode 
      ? 'rgba(30, 41, 59, 0.5)' 
      : 'rgba(255, 255, 255, 0.8)';
  }};
  border: 1px solid ${props => {
    if (props.selected) {
      return props.darkMode 
        ? 'rgba(14, 165, 233, 0.3)' 
        : 'rgba(2, 132, 199, 0.2)';
    }
    return props.darkMode 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.03)';
  }};
  box-shadow: ${props => props.selected 
    ? (props.darkMode 
      ? '0 4px 12px rgba(2, 132, 199, 0.2)' 
      : '0 4px 12px rgba(2, 132, 199, 0.1)') 
    : 'none'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.darkMode 
      ? 'rgba(0, 0, 0, 0.2)' 
      : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.h3<{ darkMode: boolean }>`
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'};
`;

const ProductPrice = styled.div<{ darkMode: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.darkMode ? 'rgba(56, 189, 248, 0.9)' : 'rgba(2, 132, 199, 0.9)'};
`;

const ProductDescription = styled.div<{ darkMode: boolean; expanded?: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
  margin: 4px 0;
  max-height: ${props => props.expanded ? 'none' : '40px'};
  overflow: ${props => props.expanded ? 'visible' : 'hidden'};
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.expanded ? 'unset' : '2'};
  -webkit-box-orient: vertical;
  white-space: pre-line;
  position: relative;
  cursor: pointer;
  
  &::after {
    content: ${props => {
      // Safely check if there are more than 2 lines of text
      const text = props.children ? String(props.children) : '';
      const hasMoreLines = !props.expanded && text.split('\n').length > 2;
      return hasMoreLines ? "'...'" : "''";
    }};
    position: absolute;
    bottom: 0;
    right: 0;
    background: ${props => props.darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)'};
    padding: 0 4px;
  }
`;

const ProductStatus = styled.div<{ darkMode: boolean, status: string }>`
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 4px;
  
  background-color: ${props => {
    if (props.status === 'In Stock') {
      return props.darkMode ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)';
    } else if (props.status === 'Low Stock') {
      return props.darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)';
    } else {
      return props.darkMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)';
    }
  }};
  
  color: ${props => {
    if (props.status === 'In Stock') {
      return props.darkMode ? 'rgba(134, 239, 172, 0.9)' : 'rgba(22, 163, 74, 0.9)';
    } else if (props.status === 'Low Stock') {
      return props.darkMode ? 'rgba(253, 230, 138, 0.9)' : 'rgba(245, 158, 11, 0.9)';
    } else {
      return props.darkMode ? 'rgba(252, 165, 165, 0.9)' : 'rgba(220, 38, 38, 0.9)';
    }
  }};
`;

const QuantityButton = styled.button<{ darkMode: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: ${props => props.darkMode 
    ? 'rgba(51, 65, 85, 0.8)' 
    : 'rgba(241, 245, 249, 0.9)'};
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.3)' 
      : 'rgba(14, 165, 233, 0.15)'};
    transform: translateY(-1px);
  }
`;

const QuantityInput = styled.input<{ darkMode: boolean }>`
  width: 70px;
  text-align: center;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  background: ${props => props.darkMode ? 'rgba(15, 23, 42, 0.3)' : 'white'};
  color: ${props => props.darkMode ? 'white' : 'black'};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? 'rgba(56, 189, 248, 0.5)' : 'rgba(2, 132, 199, 0.5)'};
  }
  
  /* Hide spinner for Chrome, Safari, Edge, Opera */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  /* Firefox */
  -moz-appearance: textfield;
`;

const EmptyMessage = styled.div<{ darkMode: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
  font-style: italic;
`;

// Icon components
const AddIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const TrashIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Replace OrderItemGrid with OrderItemList
const OrderItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const OrderItemRow = styled.div<{ darkMode: boolean }>`
  background: ${props => props.darkMode 
    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))'
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))'};
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)'};
  box-shadow: 0 8px 20px ${props => props.darkMode 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(0, 0, 0, 0.07)'};
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px ${props => props.darkMode 
      ? 'rgba(0, 0, 0, 0.3)' 
      : 'rgba(0, 0, 0, 0.1)'};
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

// Add back the missing styled component definitions
const ItemName = styled.div<{ darkMode: boolean }>`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)'};
`;

const ItemPrice = styled.div<{ darkMode: boolean }>`
  font-family: 'Monospace', 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.darkMode ? 'rgba(56, 189, 248, 0.9)' : 'rgba(2, 132, 199, 0.9)'};
`;

const ItemSubtotal = styled.div<{ darkMode: boolean }>`
  font-weight: 700;
  font-size: 1.1rem;
  background: ${props => props.darkMode 
    ? 'rgba(15, 23, 42, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'};
  padding: 8px 14px;
  border-radius: 8px;
  color: ${props => props.darkMode ? 'rgba(56, 189, 248, 0.9)' : 'rgba(2, 132, 199, 0.9)'};
`;

const RemoveButton = styled.button<{ darkMode: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: ${props => props.darkMode 
    ? 'rgba(220, 38, 38, 0.2)'
    : 'rgba(220, 38, 38, 0.1)'};
  color: ${props => props.darkMode ? 'rgba(252, 165, 165, 0.9)' : 'rgba(220, 38, 38, 0.9)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.darkMode 
      ? 'rgba(220, 38, 38, 0.4)'
      : 'rgba(220, 38, 38, 0.2)'};
    transform: scale(1.1);
  }
`;

const FormField = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label<{ darkMode: boolean }>`
  display: block;
  margin-bottom: 8px;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
  font-weight: 500;
`;

const Input = styled.input<{ darkMode: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  background: ${props => props.darkMode 
    ? 'rgba(15, 23, 42, 0.5)' 
    : 'rgba(255, 255, 255, 0.95)'};
  color: ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.9)' 
    : 'rgba(0, 0, 0, 0.8)'};
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.25)' 
      : 'rgba(2, 132, 199, 0.25)'};
    border-color: ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.5)' 
      : 'rgba(2, 132, 199, 0.5)'};
  }
`;

const TextArea = styled.textarea<{ darkMode: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  background: ${props => props.darkMode 
    ? 'rgba(15, 23, 42, 0.5)' 
    : 'rgba(255, 255, 255, 0.95)'};
  color: ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.9)' 
    : 'rgba(0, 0, 0, 0.8)'};
  font-size: 0.95rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.25)' 
      : 'rgba(2, 132, 199, 0.25)'};
    border-color: ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.5)' 
      : 'rgba(2, 132, 199, 0.5)'};
  }
`;

const CreateOrder: React.FC<CreateOrderProps> = ({
  products,
  darkMode,
  onOrderCreated,
  showNotification
}) => {
  // Use localStorage to persist order details
  const [orderDetails, setOrderDetails] = useState<OrderDetails>(() => {
    const savedOrder = localStorage.getItem('savedOrderDetails');
    return savedOrder ? JSON.parse(savedOrder) : {
      name: '',
      description: '',
      items: []
    };
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  
  // Save order details to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedOrderDetails', JSON.stringify(orderDetails));
  }, [orderDetails]);
  
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleOrderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderDetails(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  const handleOrderDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOrderDetails(prev => ({
      ...prev,
      description: e.target.value
    }));
  };
  
  const handleAddItem = (product: Product) => {
    const existingItem = orderDetails.items.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Increment quantity if item already exists
      setOrderDetails(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      }));
    } else {
      // Add new item
      setOrderDetails(prev => ({
        ...prev,
        items: [...prev.items, {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1
        }]
      }));
    }
  };
  
  const handleRemoveItem = (index: number) => {
    setOrderDetails(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    // Allow empty input or 0, ensure it's a valid number
    const quantity = isNaN(newQuantity) ? 0 : newQuantity;
    
    setOrderDetails(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.productId === productId 
          ? { ...item, quantity } 
          : item
      )
    }));
  };
  
  const calculateTotal = () => {
    return orderDetails.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleClearOrder = () => {
    if (orderDetails.name || orderDetails.description || orderDetails.items.length > 0) {
      if (window.confirm('האם אתה בטוח שברצונך לנקות את פרטי ההזמנה? כל הפריטים שהוספת יימחקו.')) {
        setOrderDetails({
          name: '',
          description: '',
          items: []
        });
        // Clear from localStorage
        localStorage.removeItem('savedOrderDetails');
        
        showNotification({
          message: 'פרטי ההזמנה נוקו בהצלחה',
          type: 'success'
        });
      }
    }
  };
  
  const handleCreateOrder = async () => {
    if (orderDetails.items.length === 0) {
      showNotification({
        message: 'לא ניתן ליצור הזמנה ריקה',
        type: 'error'
      });
      return;
    }
    
    if (!orderDetails.name.trim()) {
      showNotification({
        message: 'נדרש שם להזמנה',
        type: 'error'
      });
      return;
    }
    
    try {
      // Create new order
      await CreateOrderAPI({
        items: orderDetails.items,
        name: orderDetails.name,
        description: orderDetails.description
      });
      
      showNotification({
        message: 'ההזמנה נוצרה בהצלחה',
        type: 'success'
      });
      
      // Clear form and redirect back to orders page
      setOrderDetails({
        name: '',
        description: '',
        items: []
      });
      
      onOrderCreated();
      
      // Navigate back to orders page
      window.location.href = '/#/orders';
    } catch (error) {
      console.error('Error creating order:', error);
      showNotification({
        message: 'שגיאה ביצירת ההזמנה',
        type: 'error'
      });
    }
  };
  
  const toggleDescriptionExpansion = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the product item click
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };
  
  return (
    <PageContainer darkMode={darkMode}>
      <PageHeader darkMode={darkMode}>
        <h1>יצירת הזמנה</h1>
        <ButtonsContainer>
          <SearchBox 
            type="text" 
            placeholder="חיפוש מוצרים..."
            value={searchTerm}
            onChange={handleSearch}
            darkMode={darkMode}
          />
          <Button 
            onClick={handleCreateOrder}
            disabled={orderDetails.items.length === 0 || !orderDetails.name.trim()}
            darkMode={darkMode}
            variant="primary"
          >
            צור הזמנה
          </Button>
        </ButtonsContainer>
      </PageHeader>
      
      <OrderContent>
        <OrderPanel darkMode={darkMode}>
          <SectionTitle darkMode={darkMode}>פרטי הזמנה</SectionTitle>
          
          <FormField>
            <Label darkMode={darkMode}>שם ההזמנה *</Label>
            <Input 
              type="text"
              value={orderDetails.name}
              onChange={handleOrderNameChange}
              placeholder="הזן שם הזמנה (חובה)"
              darkMode={darkMode}
              required
            />
          </FormField>
          
          <FormField>
            <Label darkMode={darkMode}>תיאור ההזמנה</Label>
            <TextArea 
              value={orderDetails.description}
              onChange={handleOrderDescriptionChange}
              placeholder="הזן תיאור הזמנה (אופציונלי)"
              darkMode={darkMode}
            />
          </FormField>
          
          <SectionTitle darkMode={darkMode}>פריטי הזמנה</SectionTitle>
          
          {orderDetails.items.length > 0 ? (
            <>
              <OrderItemList>
                {orderDetails.items.map((item, index) => (
                  <OrderItemRow key={`${item.productId}-${index}`} darkMode={darkMode}>
                    <ItemDetails>
                      <ItemRow>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <QuantityInput 
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                            darkMode={darkMode}
                            min="0"
                          />
                          <ItemName darkMode={darkMode}>{item.productName}</ItemName>
                        </div>
                        <ItemPrice darkMode={darkMode}>{formatPrice(item.price)}</ItemPrice>
                      </ItemRow>
                    </ItemDetails>
                    
                    <ItemActions>
                      <ItemSubtotal darkMode={darkMode}>
                        {formatPrice(item.price * (item.quantity || 0))}
                      </ItemSubtotal>
                      
                      <RemoveButton
                        darkMode={darkMode}
                        onClick={() => handleRemoveItem(index)}
                        aria-label="הסר פריט"
                      >
                        <TrashIcon />
                      </RemoveButton>
                    </ItemActions>
                  </OrderItemRow>
                ))}
              </OrderItemList>
              
              <OrderSummary darkMode={darkMode}>
                <span>סה״כ:</span>
                <strong>{formatPrice(calculateTotal())}</strong>
              </OrderSummary>
              
              <Button 
                onClick={handleClearOrder}
                darkMode={darkMode}
                variant="secondary"
              >
                <TrashIcon /> נקה הזמנה
              </Button>
            </>
          ) : (
            <EmptyMessage darkMode={darkMode}>
              אין פריטים בהזמנה זו עדיין.<br/>
              סייר במוצרים ולחץ להוספה.
            </EmptyMessage>
          )}
        </OrderPanel>
        
        <ProductsPanel darkMode={darkMode}>
          <SectionTitle darkMode={darkMode}>מוצרים זמינים</SectionTitle>
          
          {filteredProducts.length > 0 ? (
            <ProductsList>
              {filteredProducts.map(product => {
                const isSelected = orderDetails.items.some(item => item.productId === product.id);
                const isExpanded = expandedDescriptions.has(product.id);
                
                return (
                  <ProductItem 
                    key={product.id}
                    darkMode={darkMode}
                    selected={isSelected}
                    onClick={() => handleAddItem(product)}
                  >
                    <ProductInfo>
                      <ProductName darkMode={darkMode}>{product.name}</ProductName>
                      <ProductDescription 
                        darkMode={darkMode} 
                        expanded={isExpanded}
                        onClick={(e) => toggleDescriptionExpansion(product.id, e)}
                      >
                        {product.description}
                      </ProductDescription>
                      <ProductPrice darkMode={darkMode}>{formatPrice(product.price)}</ProductPrice>
                      <ProductStatus 
                        darkMode={darkMode} 
                        status={product.status === 'In Stock' ? 'במלאי' : 
                         product.status === 'Low Stock' ? 'מלאי נמוך' : 
                         product.status === 'Out of Stock' ? 'אזל מהמלאי' : 
                         product.status || 'במלאי'}
                      >
                        {product.status === 'In Stock' ? 'במלאי' : 
                         product.status === 'Low Stock' ? 'מלאי נמוך' : 
                         product.status === 'Out of Stock' ? 'אזל מהמלאי' : 
                         product.status || 'במלאי'}
                      </ProductStatus>
                    </ProductInfo>
                    
                    <QuantityButton darkMode={darkMode}>
                      <AddIcon />
                    </QuantityButton>
                  </ProductItem>
                );
              })}
            </ProductsList>
          ) : (
            <EmptyMessage darkMode={darkMode}>
              לא נמצאו מוצרים התואמים את החיפוש שלך.
            </EmptyMessage>
          )}
        </ProductsPanel>
      </OrderContent>
    </PageContainer>
  );
};

export default CreateOrder; 