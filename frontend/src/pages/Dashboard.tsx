import React from 'react';
import styled from 'styled-components';

interface DashboardProps {
  productCount: number;
  orderCount: number;
  pendingOrderCount: number;
  totalSales: number;
  stockItemCount: number;
  darkMode: boolean;
}

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const Card = styled.div<{ darkMode: boolean }>`
  background-color: ${props => props.darkMode ? 'var(--color-surface-dark)' : 'var(--color-surface-light)'};
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  border: 1px solid ${props => props.darkMode ? 'var(--color-border-dark)' : 'var(--color-border-light)'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
`;

const StatCard = styled(Card)<{ color: string }>`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background-color: ${props => props.color};
    transition: width var(--transition-normal);
  }
  
  &:hover::before {
    width: 8px;
  }
`;

const StatTitle = styled.h3<{ darkMode: boolean }>`
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: ${props => props.darkMode ? 'var(--color-text-muted-dark)' : 'var(--color-text-muted-light)'};
`;

const StatValue = styled.div<{ darkMode: boolean }>`
  font-size: 2.25rem;
  font-weight: 700;
  color: ${props => props.darkMode ? 'var(--color-text-dark)' : 'var(--color-text-light)'};
  margin-bottom: 8px;
  line-height: 1.2;
`;

const StatIcon = styled.div<{ color: string }>`
  font-size: 2.5rem;
  margin-bottom: 20px;
  background: ${props => `linear-gradient(135deg, ${props.color}40, ${props.color}20)`};
  width: 64px;
  height: 64px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px ${props => `${props.color}20`};
`;

const StatFooter = styled.div<{ darkMode: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.darkMode ? 'var(--color-text-muted-dark)' : 'var(--color-text-muted-light)'};
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
`;

const WelcomeMessage = styled.div<{ darkMode: boolean }>`
  margin-bottom: 32px;
  
  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: ${props => props.darkMode ? 'var(--color-text-dark)' : 'var(--color-text-light)'};
  }
  
  p {
    font-size: 1rem;
    color: ${props => props.darkMode ? 'var(--color-text-muted-dark)' : 'var(--color-text-muted-light)'};
    max-width: 600px;
  }
`;

const Dashboard: React.FC<DashboardProps> = ({
  productCount,
  orderCount,
  pendingOrderCount,
  totalSales,
  stockItemCount,
  darkMode
}) => {
  // Get the current date for the welcome message
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString(undefined, options);

  return (
    <div>
      <WelcomeMessage darkMode={darkMode}>
        <h1>Welcome to Garden Manager</h1>
        <p>Today is {formattedDate}. Here's an overview of your garden business performance.</p>
      </WelcomeMessage>
      
      <DashboardContainer>
        <StatCard darkMode={darkMode} color="var(--color-primary)">
          <StatIcon color="var(--color-primary)">🌱</StatIcon>
          <StatTitle darkMode={darkMode}>Products</StatTitle>
          <StatValue darkMode={darkMode}>{productCount}</StatValue>
          <StatFooter darkMode={darkMode}>Total items in inventory</StatFooter>
        </StatCard>
        
        <StatCard darkMode={darkMode} color="var(--color-info)">
          <StatIcon color="var(--color-info)">📋</StatIcon>
          <StatTitle darkMode={darkMode}>Total Orders</StatTitle>
          <StatValue darkMode={darkMode}>{orderCount}</StatValue>
          <StatFooter darkMode={darkMode}>All time orders</StatFooter>
        </StatCard>
        
        <StatCard darkMode={darkMode} color="var(--color-warning)">
          <StatIcon color="var(--color-warning)">⏳</StatIcon>
          <StatTitle darkMode={darkMode}>Pending Orders</StatTitle>
          <StatValue darkMode={darkMode}>{pendingOrderCount}</StatValue>
          <StatFooter darkMode={darkMode}>Awaiting processing</StatFooter>
        </StatCard>
        
        <StatCard darkMode={darkMode} color="var(--color-success)">
          <StatIcon color="var(--color-success)">💰</StatIcon>
          <StatTitle darkMode={darkMode}>Total Sales</StatTitle>
          <StatValue darkMode={darkMode}>₪{totalSales.toFixed(2)}</StatValue>
          <StatFooter darkMode={darkMode}>Revenue from all orders</StatFooter>
        </StatCard>
        
        <StatCard darkMode={darkMode} color="var(--color-secondary)">
          <StatIcon color="var(--color-secondary)">🏬</StatIcon>
          <StatTitle darkMode={darkMode}>Stock Items</StatTitle>
          <StatValue darkMode={darkMode}>{stockItemCount}</StatValue>
          <StatFooter darkMode={darkMode}>Items in stock inventory</StatFooter>
        </StatCard>
      </DashboardContainer>
    </div>
  );
};

export default Dashboard; 