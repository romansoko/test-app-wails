import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GetOrders, UpdateOrderStatus, DeleteOrder } from '../../wailsjs/go/main/App';
import { main } from '../../wailsjs/go/models';
import { formatPrice } from '../utils/formatters';

// Backend types - only import what we use
type OrderItem = main.OrderItem;

// Custom interface for state management to avoid conflicts with backend types
interface OrderData {
  id: string;
  date: string;
  name: string;
  description: string;
  status: string;
  items: OrderItem[];
  total: number;
}

interface OrdersProps {
  darkMode: boolean;
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

const OrdersPanel = styled(GlassPanel)`
  padding: 24px;
`;

const OrderDetailsPanel = styled(GlassPanel)`
  padding: 24px;
  margin-top: 24px;
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

const OrderMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
`;

const OrderMetaItem = styled.div<{ darkMode: boolean }>`
  background: ${props => props.darkMode 
    ? 'rgba(15, 23, 42, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'};
  padding: 12px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  min-width: 150px;
  
  .label {
    font-size: 0.8rem;
    font-weight: 500;
    color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'};
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 1rem;
    font-weight: 600;
    color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
  }
`;

const StatusBadge = styled.span<{ status: string; darkMode: boolean }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  
  background-color: ${props => {
    switch (props.status) {
      case 'Pending':
        return props.darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)';
      case 'Processing':
        return props.darkMode ? 'rgba(14, 165, 233, 0.2)' : 'rgba(14, 165, 233, 0.1)';
      case 'Shipped':
        return props.darkMode ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)';
      case 'Delivered':
        return props.darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)';
      case 'Cancelled':
        return props.darkMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)';
      default:
        return props.darkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(100, 116, 139, 0.1)';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'Pending':
        return props.darkMode ? 'rgba(253, 230, 138, 0.9)' : 'rgba(245, 158, 11, 0.9)';
      case 'Processing':
        return props.darkMode ? 'rgba(56, 189, 248, 0.9)' : 'rgba(14, 165, 233, 0.9)';
      case 'Shipped':
        return props.darkMode ? 'rgba(134, 239, 172, 0.9)' : 'rgba(22, 163, 74, 0.9)';
      case 'Delivered':
        return props.darkMode ? 'rgba(94, 234, 212, 0.9)' : 'rgba(16, 185, 129, 0.9)';
      case 'Cancelled':
        return props.darkMode ? 'rgba(252, 165, 165, 0.9)' : 'rgba(220, 38, 38, 0.9)';
      default:
        return props.darkMode ? 'rgba(203, 213, 225, 0.9)' : 'rgba(100, 116, 139, 0.9)';
    }
  }};
`;

const StatusSelector = styled.select<{ darkMode: boolean }>`
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  background: ${props => props.darkMode 
    ? 'rgba(30, 41, 59, 0.5)' 
    : 'rgba(255, 255, 255, 0.95)'};
  color: ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.9)' 
    : 'rgba(0, 0, 0, 0.8)'};
  min-width: 200px;
  cursor: pointer;
  appearance: none;
  background-image: ${props => props.darkMode
    ? 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255, 255, 255, 0.5)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")'
    : 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(0, 0, 0, 0.5)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")'};
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? 'var(--color-primary-light)' : 'var(--color-primary)'};
    box-shadow: 0 0 0 3px ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.25)' 
      : 'rgba(2, 132, 199, 0.25)'};
  }
`;

const Button = styled.button<{ darkMode: boolean; variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
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
  box-shadow: 0 4px 8px ${props => props.variant === 'primary'
    ? (props.darkMode 
      ? 'rgba(2, 132, 199, 0.3)' 
      : 'rgba(2, 132, 199, 0.2)')
    : 'rgba(0, 0, 0, 0.05)'};
    
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px ${props => props.variant === 'primary'
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
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

const SearchBox = styled.input<{ darkMode: boolean }>`
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  background: ${props => props.darkMode 
    ? 'rgba(30, 41, 59, 0.5)' 
    : 'rgba(255, 255, 255, 0.95)'};
  color: ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.9)' 
    : 'rgba(0, 0, 0, 0.8)'};
  flex: 1;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? 'var(--color-primary-light)' : 'var(--color-primary)'};
    box-shadow: 0 0 0 3px ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.25)' 
      : 'rgba(2, 132, 199, 0.25)'};
  }
  
  &::placeholder {
    color: ${props => props.darkMode 
      ? 'rgba(255, 255, 255, 0.4)' 
      : 'rgba(0, 0, 0, 0.3)'};
  }
`;

const StatusFilter = styled.select<{ darkMode: boolean }>`
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  background: ${props => props.darkMode 
    ? 'rgba(30, 41, 59, 0.5)' 
    : 'rgba(255, 255, 255, 0.95)'};
  color: ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.9)' 
    : 'rgba(0, 0, 0, 0.8)'};
  min-width: 150px;
  cursor: pointer;
  appearance: none;
  background-image: ${props => props.darkMode
    ? 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255, 255, 255, 0.5)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")'
    : 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(0, 0, 0, 0.5)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")'};
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? 'var(--color-primary-light)' : 'var(--color-primary)'};
    box-shadow: 0 0 0 3px ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.25)' 
      : 'rgba(2, 132, 199, 0.25)'};
  }
`;

const DateFilter = styled.input<{ darkMode: boolean }>`
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  background: ${props => props.darkMode 
    ? 'rgba(30, 41, 59, 0.5)' 
    : 'rgba(255, 255, 255, 0.95)'};
  color: ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.9)' 
    : 'rgba(0, 0, 0, 0.8)'};
  min-width: 150px;
  
  &::-webkit-calendar-picker-indicator {
    filter: ${props => props.darkMode ? 'invert(1)' : 'none'};
    cursor: pointer;
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? 'var(--color-primary-light)' : 'var(--color-primary)'};
    box-shadow: 0 0 0 3px ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.25)' 
      : 'rgba(2, 132, 199, 0.25)'};
  }
`;

const EmptyMessage = styled.div<{ darkMode: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
  font-style: italic;
`;

const OrderTotal = styled.div<{ darkMode: boolean }>`
  margin-top: 16px;
  text-align: right;
  padding: 12px 20px;
  background: ${props => props.darkMode 
    ? 'rgba(15, 23, 42, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'};
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  
  span {
    color: ${props => props.darkMode ? 'rgba(56, 189, 248, 0.9)' : 'rgba(2, 132, 199, 0.9)'};
  }
`;

// Card-based components to replace tables
const OrderCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const OrderCard = styled(GlassPanel)<{ darkMode: boolean; selected?: boolean }>`
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  transform-style: preserve-3d;
  transform: ${props => props.selected ? 'scale(1.02)' : 'scale(1)'};
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    border: 2px solid transparent;
    border-color: ${props => props.selected 
      ? (props.darkMode ? 'var(--color-primary-light)' : 'var(--color-primary)') 
      : 'transparent'};
    box-shadow: ${props => props.selected 
      ? `0 0 20px ${props.darkMode ? 'rgba(56, 189, 248, 0.5)' : 'rgba(2, 132, 199, 0.25)'}` 
      : 'none'};
    transition: all 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-5px) ${props => props.selected ? 'scale(1.02)' : 'scale(1)'};
    
    &::before {
      border-color: ${props => props.darkMode 
        ? 'rgba(56, 189, 248, 0.5)' 
        : 'rgba(2, 132, 199, 0.5)'};
    }
  }
`;

const OrderCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const OrderDate = styled.div<{ darkMode: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
`;

const OrderCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const OrderCardTotal = styled.div<{ darkMode: boolean }>`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${props => props.darkMode ? 'rgba(56, 189, 248, 0.9)' : 'rgba(2, 132, 199, 0.9)'};
`;

// Replace OrderItemGrid with OrderItemList
const OrderItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const OrderItemRow = styled.div<{ darkMode: boolean }>`
  background: ${props => props.darkMode 
    ? 'rgba(15, 23, 42, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'};
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px ${props => props.darkMode 
      ? 'rgba(0, 0, 0, 0.3)' 
      : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ItemName = styled.div<{ darkMode: boolean }>`
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)'};
`;

const ItemPrice = styled.div<{ darkMode: boolean }>`
  font-family: 'Monospace', 'Courier New', monospace;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.6)'};
`;

const ItemQuantity = styled.div<{ darkMode: boolean }>`
  padding: 4px 10px;
  background: ${props => props.darkMode 
    ? 'rgba(51, 65, 85, 0.5)'
    : 'rgba(241, 245, 249, 0.8)'};
  border-radius: 16px;
  font-size: 0.85rem;
  width: fit-content;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.7)'};
`;

const ItemSubtotal = styled.div<{ darkMode: boolean }>`
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  font-weight: 600;
  font-size: 0.95rem;
  text-align: right;
  color: ${props => props.darkMode ? 'rgba(56, 189, 248, 0.9)' : 'rgba(2, 132, 199, 0.9)'};
`;

// Icon components
const EyeIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Add these new icons for edit and delete
const TrashIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
  </svg>
);

// Update the OrderNameDisplay
const OrderName = styled.h2<{ darkMode: boolean }>`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'};
`;

// Fix OrderId component for correct styling
// This will show just the ID number next to the order name
const OrderId = styled.span<{ darkMode: boolean }>`
  margin-left: 8px;
  font-size: 0.85rem;
  font-weight: normal;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
`;

// Create a dedicated ActionIconButton component to better handle event propagation
const ActionIconButton = styled.button<{ darkMode: boolean; variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${props => {
    switch (props.variant) {
      case 'danger':
        return props.darkMode 
          ? 'rgba(220, 38, 38, 0.2)' 
          : 'rgba(220, 38, 38, 0.1)';
      case 'primary':
        return props.darkMode 
          ? 'rgba(56, 189, 248, 0.2)' 
          : 'rgba(14, 165, 233, 0.1)';
      default:
        return props.darkMode 
          ? 'rgba(100, 116, 139, 0.2)' 
          : 'rgba(100, 116, 139, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'danger':
        return props.darkMode 
          ? 'rgba(220, 38, 38, 0.9)' 
          : 'rgba(220, 38, 38, 0.8)';
      case 'primary':
        return props.darkMode 
          ? 'rgba(56, 189, 248, 0.9)' 
          : 'rgba(14, 165, 233, 0.8)';
      default:
        return props.darkMode 
          ? 'rgba(255, 255, 255, 0.8)' 
          : 'rgba(0, 0, 0, 0.6)';
    }
  }};
  
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)'
  };
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => {
      switch (props.variant) {
        case 'danger':
          return props.darkMode 
            ? 'rgba(220, 38, 38, 0.3)' 
            : 'rgba(220, 38, 38, 0.2)';
        case 'primary':
          return props.darkMode 
            ? 'rgba(56, 189, 248, 0.3)' 
            : 'rgba(14, 165, 233, 0.2)';
        default:
          return props.darkMode 
            ? 'rgba(100, 116, 139, 0.3)' 
            : 'rgba(100, 116, 139, 0.2)';
      }
    }};
  }
`;

const Orders: React.FC<OrdersProps> = ({ darkMode, showNotification }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await GetOrders();
      // Convert backend Order type to our OrderData type
      const orderData: OrderData[] = Array.isArray(data) ? data.map(order => ({
        id: order.id,
        date: order.date,
        name: order.name || `הזמנה #${order.id}`, // Fallback for old orders
        description: order.description || '',
        status: order.status,
        items: order.items || [],
        total: order.total
      })) : [];
      setOrders(orderData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      showNotification({
        message: 'שגיאה בטעינת ההזמנות',
        type: 'error'
      });
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadOrders();
  }, []);
  
  const handleViewOrder = (order: OrderData) => {
    setSelectedOrder(order);
    setOrderItems(order.items || []);
  };
  
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Show loading indicator if needed
      showNotification({
        message: 'מעדכן סטטוס הזמנה...',
        type: 'info'
      });
      
      await UpdateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
      showNotification({
        message: 'סטטוס ההזמנה עודכן בהצלחה',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification({
        message: 'שגיאה בעדכון סטטוס ההזמנה',
        type: 'error'
      });
    }
  };
  
  const handleDeleteOrder = async (orderId: string) => {
    try {
      // Call the backend API to delete the order
      await DeleteOrder(orderId);
      
      // Update the local state
      setOrders(prev => prev.filter(order => order.id !== orderId));
      
      // If the deleted order was selected, clear the selection
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      
      showNotification({
        message: 'ההזמנה נמחקה בהצלחה',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      showNotification({
        message: 'שגיאה במחיקת ההזמנה',
        type: 'error'
      });
    }
  };
  
  const handleConfirmDelete = (orderId: string, event: React.MouseEvent) => {
    if (event) {
      event.preventDefault(); // Prevent default button behavior
      event.stopPropagation(); // Stop event from bubbling to parent
    }
    
    setOrderToDelete(orderId);
    setShowConfirmDelete(true);
  };
  
  const confirmDelete = () => {
    if (orderToDelete) {
      handleDeleteOrder(orderToDelete);
      setShowConfirmDelete(false);
      setOrderToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setOrderToDelete(null);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Filter orders by status, search term, and date
  const filteredOrders = orders.filter(order => {
    // Status filter
    const matchesFilter = statusFilter === 'All' || order.status === statusFilter;
    
    // Search term filter (search by ID or name)
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter
    const matchesDate = dateFilter === '' || 
      (order.date.split(' ')[0] === dateFilter);
    
    return matchesFilter && matchesSearch && matchesDate;
  });
  
  return (
    <PageContainer darkMode={darkMode}>
      <PageHeader darkMode={darkMode}>
        <h1>הזמנות</h1>
      </PageHeader>
      
      <OrdersPanel darkMode={darkMode}>
        <SectionTitle darkMode={darkMode}>רשימת הזמנות</SectionTitle>
        
        <FilterContainer>
          <SearchBox 
            type="text"
            placeholder="חפש לפי שם הזמנה או מזהה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            darkMode={darkMode}
          />
          
          <DateFilter
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            darkMode={darkMode}
          />
          
          <StatusFilter
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            darkMode={darkMode}
          >
            <option value="All">כל הסטטוסים</option>
            <option value="Pending">ממתין</option>
            <option value="Processing">בטיפול</option>
            <option value="Shipped">נשלח</option>
            <option value="Delivered">נמסר</option>
            <option value="Cancelled">בוטל</option>
          </StatusFilter>
        </FilterContainer>
        
        {loading ? (
          <EmptyMessage darkMode={darkMode}>טוען הזמנות...</EmptyMessage>
        ) : filteredOrders.length > 0 ? (
          <OrderCardGrid>
            {filteredOrders.map(order => (
              <OrderCard 
                key={order.id} 
                darkMode={darkMode}
                onClick={() => handleViewOrder(order)}
                selected={selectedOrder?.id === order.id}
              >
                <OrderCardHeader>
                  <div>
                    <OrderName darkMode={darkMode}>
                      {order.name}
                      <OrderId darkMode={darkMode}>#{order.id}</OrderId>
                    </OrderName>
                    <OrderDate darkMode={darkMode}>{formatDate(order.date)}</OrderDate>
                  </div>
                  <StatusBadge status={order.status} darkMode={darkMode}>
                    {order.status === 'Pending' ? 'ממתין' :
                     order.status === 'Processing' ? 'בטיפול' :
                     order.status === 'Shipped' ? 'נשלח' :
                     order.status === 'Delivered' ? 'נמסר' :
                     order.status === 'Cancelled' ? 'בוטל' : order.status}
                  </StatusBadge>
                </OrderCardHeader>
                
                <div>
                  <div style={{ fontSize: '0.85rem', color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                    {order.items.length} {order.items.length === 1 ? 'פריט' : 'פריטים'}
                  </div>
                </div>
                
                <OrderCardFooter onClick={(e) => e.stopPropagation()}>
                  <OrderCardTotal darkMode={darkMode}>{formatPrice(order.total)}</OrderCardTotal>
                  <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                    <ActionIconButton 
                      darkMode={darkMode} 
                      variant="danger"
                      onClick={(e) => handleConfirmDelete(order.id, e)}
                      aria-label="מחק הזמנה"
                    >
                      <TrashIcon />
                    </ActionIconButton>
                    
                    <ActionIconButton
                      darkMode={darkMode}
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOrder(order);
                      }}
                      aria-label="הצג פרטי הזמנה"
                    >
                      <EyeIcon />
                    </ActionIconButton>
                  </div>
                </OrderCardFooter>
              </OrderCard>
            ))}
          </OrderCardGrid>
        ) : (
          <EmptyMessage darkMode={darkMode}>
            לא נמצאו הזמנות התואמות את החיפוש שלך.
          </EmptyMessage>
        )}
      </OrdersPanel>
      
      {selectedOrder && (
        <OrderDetailsPanel darkMode={darkMode}>
          <SectionTitle darkMode={darkMode}>פרטי הזמנה</SectionTitle>
          
          <OrderMeta>
            <OrderMetaItem darkMode={darkMode}>
              <div className="label">שם הזמנה</div>
              <div className="value">{selectedOrder.name}</div>
            </OrderMetaItem>
            
            <OrderMetaItem darkMode={darkMode}>
              <div className="label">מזהה הזמנה</div>
              <div className="value">#{selectedOrder.id}</div>
            </OrderMetaItem>
            
            <OrderMetaItem darkMode={darkMode}>
              <div className="label">נוצר בתאריך</div>
              <div className="value">{formatDate(selectedOrder.date)}</div>
            </OrderMetaItem>
            
            <OrderMetaItem darkMode={darkMode}>
              <div className="label">סטטוס</div>
              <div className="value">
                <StatusSelector
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  darkMode={darkMode}
                >
                  <option value="Pending">ממתין</option>
                  <option value="Processing">בטיפול</option>
                  <option value="Shipped">נשלח</option>
                  <option value="Delivered">נמסר</option>
                  <option value="Cancelled">בוטל</option>
                </StatusSelector>
              </div>
            </OrderMetaItem>
          </OrderMeta>
          
          {selectedOrder.description && (
            <OrderMetaItem darkMode={darkMode} style={{ marginBottom: '20px' }}>
              <div className="label">תיאור</div>
              <div className="value" style={{ whiteSpace: 'pre-wrap' }}>{selectedOrder.description}</div>
            </OrderMetaItem>
          )}
          
          {orderItems.length > 0 ? (
            <OrderItemList>
              {orderItems.map((item, index) => (
                <OrderItemRow key={`${item.productId}-${index}`} darkMode={darkMode}>
                  <ItemDetails>
                    <ItemRow>
                      <ItemName darkMode={darkMode}>{item.productName}</ItemName>
                      <ItemPrice darkMode={darkMode}>{formatPrice(item.price)} לפריט</ItemPrice>
                    </ItemRow>
                    <ItemRow>
                      <ItemQuantity darkMode={darkMode}>כמות: {item.quantity}</ItemQuantity>
                      <ItemSubtotal darkMode={darkMode}>{formatPrice(item.price * item.quantity)}</ItemSubtotal>
                    </ItemRow>
                  </ItemDetails>
                </OrderItemRow>
              ))}
            </OrderItemList>
          ) : (
            <EmptyMessage darkMode={darkMode}>אין פריטים בהזמנה זו</EmptyMessage>
          )}
          
          <OrderTotal darkMode={darkMode}>
            <span>סה״כ:</span>
            <strong>{formatPrice(calculateTotal(orderItems))}</strong>
          </OrderTotal>
        </OrderDetailsPanel>
      )}
      
      {/* Confirmation Dialog for Delete */}
      {showConfirmDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0',
              color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'
            }}>
              אישור מחיקה
            </h3>
            <p style={{ 
              margin: '0 0 20px 0',
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
            }}>
              האם אתה בטוח שברצונך למחוק הזמנה זו? פעולה זו אינה ניתנת לביטול.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button 
                onClick={cancelDelete} 
                darkMode={darkMode}
                variant="secondary"
              >
                ביטול
              </Button>
              <Button 
                onClick={confirmDelete} 
                darkMode={darkMode}
                variant="primary"
                style={{ backgroundColor: darkMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)', 
                        color: darkMode ? 'rgba(220, 38, 38, 0.9)' : 'rgba(220, 38, 38, 0.8)' }}
              >
                מחק
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default Orders;