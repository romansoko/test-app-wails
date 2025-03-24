import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { GardenLogo } from '../components/GardenLogo';
import { FaBoxes } from 'react-icons/fa';

interface SidebarLayoutProps {
  children: React.ReactNode;
  currentTime: string;
  darkMode: boolean;
  toggleDarkMode: () => void;
  dbStatus: string;
  activePage: string;
  setActivePage: (page: string) => void;
}

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const LayoutContainer = styled.div<{ darkMode: boolean }>`
  display: flex;
  height: 100vh;
  background-color: ${props => props.darkMode ? '#0f172a' : '#f8fafc'};
  color: ${props => props.darkMode ? '#e2e8f0' : '#1e293b'};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
  transition: background-color 0.3s ease;
  
  ${props => props.darkMode ? `
    background-image: 
      radial-gradient(at 100% 0%, rgba(76, 175, 80, 0.03) 0, transparent 50%),
      radial-gradient(at 0% 100%, rgba(0, 100, 255, 0.03) 0, transparent 50%);
  ` : `
    background-image: 
      radial-gradient(at 100% 0%, rgba(76, 175, 80, 0.05) 0, transparent 50%),
      radial-gradient(at 0% 100%, rgba(0, 100, 255, 0.05) 0, transparent 50%);
  `}
`;

const Sidebar = styled.div<{ darkMode: boolean, collapsed: boolean }>`
  width: ${props => props.collapsed ? '78px' : '290px'};
  height: 100vh;
  background: ${props => props.darkMode 
    ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(18, 24, 38, 0.95) 100%)'
    : 'linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  backdrop-filter: blur(12px);
  border-right: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)'};
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.darkMode 
    ? '0 10px 30px -10px rgba(0, 0, 0, 0.3)' 
    : '0 10px 30px -10px rgba(0, 0, 0, 0.1)'};
  overflow: hidden;
  z-index: 100;
  
  /* Subtle pattern overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: ${props => props.darkMode 
      ? 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")'
      : 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")'};
    pointer-events: none;
    z-index: -1;
  }
`;

const CollapseButton = styled.button<{ darkMode: boolean, collapsed: boolean }>`
  position: absolute;
  top: 25px;
  right: ${props => props.collapsed ? "-12px" : "-12px"};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.darkMode 
    ? 'linear-gradient(135deg, #4ade80, #22c55e)' 
    : 'linear-gradient(135deg, #4ade80, #22c55e)'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  box-shadow: 0 2px 10px rgba(34, 197, 94, 0.4);
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 15px rgba(34, 197, 94, 0.6);
  }
  
  svg {
    width: 14px;
    height: 14px;
    transform: ${props => props.collapsed ? 'rotate(0deg)' : 'rotate(180deg)'};
    transition: transform 0.3s ease;
  }
`;

const SidebarHeader = styled.div<{ darkMode: boolean, collapsed: boolean }>`
  padding: ${props => props.collapsed ? '25px 0 20px' : '25px 25px 20px'};
  display: flex;
  flex-direction: column;
  align-items: ${props => props.collapsed ? 'center' : 'flex-start'};
`;

const LogoContainer = styled.div<{ darkMode: boolean, collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.collapsed ? '0' : '15px'};
  margin-bottom: ${props => props.collapsed ? '0' : '5px'};
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  width: 100%;
`;

const LogoIconWrapper = styled.div<{ darkMode: boolean }>`
  width: 36px;
  height: 36px;
  background: ${props => props.darkMode 
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))' 
    : 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 6px rgba(34, 197, 94, 0.25));
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    filter: drop-shadow(0 6px 8px rgba(34, 197, 94, 0.3));
  }
  
  .logo {
    width: 24px;
    height: 24px;
    transition: all 0.3s ease;
  }
`;

const AppTitle = styled.h1<{ collapsed: boolean, darkMode: boolean }>`
  font-size: 1.35rem;
  font-weight: 600;
  margin: 0;
  background: ${props => props.darkMode 
    ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' 
    : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  opacity: ${props => props.collapsed ? 0 : 1};
  width: ${props => props.collapsed ? 0 : 'auto'};
  overflow: hidden;
  white-space: nowrap;
  transition: all 0.3s ease;
  
  /* Subtle text shadow for better readability */
  text-shadow: ${props => props.darkMode 
    ? '0 1px 2px rgba(0, 0, 0, 0.1)' 
    : '0 1px 2px rgba(255, 255, 255, 0.1)'};
`;

const NavMenuContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  margin-top: 15px;
  
  /* Sleek scrollbar for the navigation menu */
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 10px;
  }
`;

const SectionTitle = styled.div<{ darkMode: boolean, collapsed: boolean }>`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
  margin: ${props => props.collapsed ? '10px 0' : '10px 25px'};
  opacity: ${props => props.collapsed ? 0 : 1};
  height: ${props => props.collapsed ? '10px' : 'auto'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const NavMenu = styled.nav<{ collapsed: boolean }>`
  padding: ${props => props.collapsed ? '0' : '0 8px'};
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const NavItem = styled.button<{ active: boolean, darkMode: boolean, collapsed: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${props => props.collapsed ? '12px 0' : '12px 16px'};
  margin: ${props => props.collapsed ? '3px 0' : '3px 0'};
  background: ${props => props.active 
    ? props.darkMode 
      ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))' 
      : 'linear-gradient(90deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))'
    : 'transparent'};
  border: none;
  border-radius: ${props => props.collapsed ? '0' : '10px'};
  text-align: left;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  position: relative;
  overflow: hidden;
  
  color: ${props => {
    if (props.active) {
      return props.darkMode ? '#4ade80' : '#16a34a';
    }
    return props.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  }};
  
  /* Active indicator */
  ${props => props.active && `
    &::before {
      content: '';
      position: absolute;
      left: ${props.collapsed ? '0' : '6px'};
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: ${props.collapsed ? '60%' : '60%'};
      background: linear-gradient(to bottom, #4ade80, #22c55e);
      border-radius: 10px;
      opacity: ${props.collapsed ? '1' : '1'};
    }
  `}
  
  &:hover {
    background: ${props => props.darkMode 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.03)'};
    color: ${props => props.darkMode ? (props.active ? '#4ade80' : '#ffffff') : (props.active ? '#16a34a' : '#000000')};
  }
  
  /* Hover effect - subtle shine */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'},
      transparent
    );
    transition: left 0.7s ease;
  }
  
  &:hover::after {
    left: 100%;
  }
  
  .icon {
    margin-right: ${props => props.collapsed ? '0' : '14px'};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    position: relative;
    width: 22px;
    height: 22px;
    
    svg {
      width: 19px;
      height: 19px;
      color: ${props => {
        if (props.active) {
          return props.darkMode ? '#4ade80' : '#16a34a';
        }
        return props.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
      }};
      transition: all 0.2s ease;
      /* For active items, add a subtle glow effect */
      filter: ${props => props.active ? 'drop-shadow(0 0 3px rgba(74, 222, 128, 0.3))' : 'none'};
    }
  }
  
  &:hover .icon svg {
    color: ${props => props.darkMode ? '#4ade80' : '#16a34a'};
    transform: ${props => props.collapsed ? 'scale(1.1)' : 'translateX(2px)'};
  }
  
  .label {
    opacity: ${props => props.collapsed ? 0 : 1};
    width: ${props => props.collapsed ? 0 : 'auto'};
    overflow: hidden;
    white-space: nowrap;
    transition: all 0.3s ease;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  position: relative;
  animation: ${fadeIn} 0.5s ease-out;
  
  /* Sleek scrollbar for main content */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
  }
`;

const Header = styled.header<{ darkMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 18px;
  border-bottom: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'};
`;

const PageTitle = styled.h2<{ darkMode: boolean }>`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)'};
  position: relative;
  padding-bottom: 5px;
  letter-spacing: -0.02em;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -3px;
    width: 40px;
    height: 3px;
    background: ${props => props.darkMode 
      ? 'linear-gradient(to right, #4ade80, rgba(74, 222, 128, 0.3))' 
      : 'linear-gradient(to right, #16a34a, rgba(22, 163, 74, 0.3))'};
    border-radius: 3px;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusIndicator = styled.div<{ isError: boolean, darkMode: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: ${props => props.isError 
    ? (props.darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)') 
    : (props.darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)')};
  color: ${props => props.isError 
    ? (props.darkMode ? '#ef4444' : '#dc2626') 
    : (props.darkMode ? '#4ade80' : '#16a34a')};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    background-color: ${props => props.isError 
      ? (props.darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.12)') 
      : (props.darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.12)')};
  }
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.isError 
      ? (props.darkMode ? '#ef4444' : '#dc2626') 
      : (props.darkMode ? '#4ade80' : '#16a34a')};
    box-shadow: 0 0 ${props => props.isError ? '8px #ef4444' : '8px #4ade80'};
    position: relative;
    
    /* Pulsing animation for the dot */
    animation: ${pulse} 2s infinite;
  }
`;

const TimeDisplay = styled.div<{ darkMode: boolean }>`
  font-size: 0.8rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    background-color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
  }
  
  svg {
    width: 14px;
    height: 14px;
    color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'};
  }
`;

const ThemeToggle = styled.button<{ darkMode: boolean }>`
  background: ${props => props.darkMode 
    ? 'linear-gradient(135deg, #334155, #1e293b)' 
    : 'linear-gradient(135deg, #f8fafc, #e2e8f0)'};
  border: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: rotate(15deg) scale(1.1);
    box-shadow: 0 4px 12px ${props => props.darkMode 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)'};
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)'};
    transition: all 0.3s ease;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${props => props.darkMode 
      ? 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%)' 
      : 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%)'};
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const SidebarFooter = styled.div<{ darkMode: boolean, collapsed: boolean }>`
  padding: ${props => props.collapsed ? '16px 8px' : '16px 24px'};
  border-top: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
  font-size: 0.75rem;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
  text-align: center;
  opacity: ${props => props.collapsed ? 0 : 1};
  height: ${props => props.collapsed ? '16px' : 'auto'};
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: auto;
`;

// SVG Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const ProductsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" y1="22" x2="12" y2="12" />
  </svg>
);

const CreateOrderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="10" y1="11" x2="14" y2="11" />
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  currentTime,
  darkMode,
  toggleDarkMode,
  dbStatus,
  activePage,
  setActivePage
}) => {
  const [collapsed, setCollapsed] = useState(false);
  
  // Helper function to render icons properly with TypeScript
  const renderIcon = (Icon: any, size = 20) => <Icon size={size} />;
  
  return (
    <LayoutContainer darkMode={darkMode}>
      <Sidebar darkMode={darkMode} collapsed={collapsed}>
        <CollapseButton 
          darkMode={darkMode} 
          collapsed={collapsed}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "הרחב תפריט" : "צמצם תפריט"}
        >
          <ChevronRightIcon />
        </CollapseButton>
        
        <SidebarHeader darkMode={darkMode} collapsed={collapsed}>
          <LogoContainer darkMode={darkMode} collapsed={collapsed}>
            <LogoIconWrapper darkMode={darkMode}>
              <GardenLogo className="logo" />
            </LogoIconWrapper>
            <AppTitle collapsed={collapsed} darkMode={darkMode}>
              מנהל גינה
            </AppTitle>
          </LogoContainer>
        </SidebarHeader>
        
        <NavMenuContainer>
          <SectionTitle darkMode={darkMode} collapsed={collapsed}>תפריט ראשי</SectionTitle>
          <NavMenu collapsed={collapsed}>
            <NavItem 
              active={activePage === "dashboard"} 
              darkMode={darkMode}
              collapsed={collapsed}
              onClick={() => setActivePage("dashboard")}
            >
              <span className="icon"><DashboardIcon /></span>
              <span className="label">לוח בקרה</span>
            </NavItem>
            <NavItem 
              active={activePage === "products"} 
              darkMode={darkMode}
              collapsed={collapsed}
              onClick={() => setActivePage("products")}
            >
              <span className="icon"><ProductsIcon /></span>
              <span className="label">מוצרים</span>
            </NavItem>
            <NavItem 
              active={activePage === "create-order"} 
              darkMode={darkMode}
              collapsed={collapsed}
              onClick={() => setActivePage("create-order")}
            >
              <span className="icon"><CreateOrderIcon /></span>
              <span className="label">צור הזמנה</span>
            </NavItem>
            <NavItem 
              active={activePage === "orders"} 
              darkMode={darkMode}
              collapsed={collapsed}
              onClick={() => setActivePage("orders")}
            >
              <span className="icon"><OrdersIcon /></span>
              <span className="label">הזמנות</span>
            </NavItem>
            <NavItem 
              active={activePage === "stock"}
              darkMode={darkMode} 
              collapsed={collapsed}
              onClick={() => setActivePage("stock")}
            >
              <span className="icon">{renderIcon(FaBoxes)}</span>
              <span className="label">מלאי</span>
            </NavItem>
          </NavMenu>
        </NavMenuContainer>
        
        <SidebarFooter darkMode={darkMode} collapsed={collapsed}>
          © 2025 מנהל מוצרי גינה
        </SidebarFooter>
      </Sidebar>
      
      <MainContent>
        <Header darkMode={darkMode}>
          <PageTitle darkMode={darkMode}>
            {activePage === "dashboard" ? "לוח בקרה" : 
             activePage === "products" ? "מוצרים" :
             activePage === "create-order" ? "צור הזמנה" :
             activePage === "orders" ? "הזמנות" :
             activePage === "stock" ? "מלאי" :
             activePage.charAt(0).toUpperCase() + activePage.slice(1).replace('-', ' ')}
          </PageTitle>
          
          <HeaderRight>
            <StatusIndicator isError={dbStatus.includes('error')} darkMode={darkMode}>
              <div className="dot"></div>
              <span>{dbStatus.includes('error') ? 'שגיאת מסד נתונים' : 'מחובר'}</span>
            </StatusIndicator>
            
            <TimeDisplay darkMode={darkMode}>
              <ClockIcon />
              <span>{currentTime}</span>
            </TimeDisplay>
            
            <ThemeToggle 
              darkMode={darkMode}
              onClick={toggleDarkMode} 
              aria-label={darkMode ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
              title={darkMode ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </ThemeToggle>
          </HeaderRight>
        </Header>
        
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default SidebarLayout; 