import React from 'react';
import styled from 'styled-components';
import { FaBoxes } from 'react-icons/fa';
import { AiOutlineDashboard, AiOutlineFileAdd, AiOutlineOrderedList } from 'react-icons/ai';
import { MdProductionQuantityLimits } from 'react-icons/md';

interface SidebarMenuProps {
  activePage: string;
  setActivePage: (page: string) => void;
  darkMode: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: AiOutlineDashboard },
  { id: 'products', label: 'Products', icon: MdProductionQuantityLimits },
  { id: 'create-order', label: 'Create Order', icon: AiOutlineFileAdd },
  { id: 'orders', label: 'Orders', icon: AiOutlineOrderedList },
  { id: 'stock', label: 'Stock', icon: FaBoxes },
];

// Styled components
const MenuContainer = styled.div<{ darkMode: boolean }>`
  display: flex;
  flex-direction: column;
  background: ${props => props.darkMode 
    ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))'
    : 'linear-gradient(180deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.9))'};
  backdrop-filter: blur(10px);
  border-right: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)'};
  height: 100vh;
  padding: 20px 0;
  width: 240px;
  position: sticky;
  top: 0;
`;

const Logo = styled.div<{ darkMode: boolean }>`
  color: ${props => props.darkMode ? 'white' : 'black'};
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0 20px 20px;
  border-bottom: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)'};
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 20px 0;
  margin: 0;
`;

const MenuItem = styled.li<{ active: boolean; darkMode: boolean }>`
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${props => props.active 
    ? (props.darkMode ? 'rgba(56, 189, 248, 0.9)' : 'rgba(14, 165, 233, 0.9)') 
    : (props.darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)')};
  background: ${props => props.active
    ? (props.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.7)')
    : 'transparent'};
  border-left: 3px solid ${props => props.active
    ? (props.darkMode ? 'var(--color-primary-light)' : 'var(--color-primary)')
    : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.darkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.5)'};
    color: ${props => props.active 
      ? (props.darkMode ? 'rgba(56, 189, 248, 0.9)' : 'rgba(14, 165, 233, 0.9)') 
      : (props.darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)')};
  }
`;

const MenuIcon = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
`;

const SidebarMenu: React.FC<SidebarMenuProps> = ({ activePage, setActivePage, darkMode }) => {
  // Create icon components properly
  const renderIcon = (Icon: any) => <Icon size={20} />;
  
  return (
    <MenuContainer darkMode={darkMode}>
      <Logo darkMode={darkMode}>Stock Manager</Logo>
      <MenuList>
        {menuItems.map(item => (
          <MenuItem
            key={item.id}
            active={activePage === item.id}
            darkMode={darkMode}
            onClick={() => setActivePage(item.id)}
          >
            <MenuIcon>{renderIcon(item.icon)}</MenuIcon>
            {item.label}
          </MenuItem>
        ))}
      </MenuList>
    </MenuContainer>
  );
};

export default SidebarMenu; 