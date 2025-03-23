import React from 'react';
import styled, { keyframes } from 'styled-components';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  darkMode: boolean;
  type?: 'danger' | 'warning' | 'info';
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const DialogContainer = styled.div<{ darkMode: boolean }>`
  background-color: ${props => props.darkMode ? '#1e293b' : '#ffffff'};
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 450px;
  padding: 0;
  overflow: hidden;
  animation: ${slideIn} 0.3s ease-out;
  border: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
`;

const DialogHeader = styled.div<{ darkMode: boolean, type: string }>`
  background-color: ${props => {
    if (props.type === 'danger') return props.darkMode ? '#6b1919' : '#fee2e2';
    if (props.type === 'warning') return props.darkMode ? '#854d0e' : '#fef9c3';
    return props.darkMode ? '#0c4a6e' : '#e0f2fe';
  }};
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DialogIcon = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 0;
`;

const getIcon = (type: string) => {
  switch(type) {
    case 'danger': return '🗑️';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
  }
};

const DialogTitle = styled.h3<{ darkMode: boolean, type: string }>`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => {
    if (props.type === 'danger') return props.darkMode ? '#fca5a5' : '#b91c1c';
    if (props.type === 'warning') return props.darkMode ? '#fde68a' : '#b45309';
    return props.darkMode ? '#bae6fd' : '#0369a1';
  }};
`;

const DialogContent = styled.div<{ darkMode: boolean }>`
  padding: 24px;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
  font-size: 0.95rem;
  line-height: 1.5;
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background-color: ${props => props.theme.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)'};
  
  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 8px;
  }
`;

const Button = styled.button<{ 
  darkMode: boolean, 
  isPrimary?: boolean, 
  isDanger?: boolean 
}>`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  background-color: ${props => {
    if (props.isDanger) return props.darkMode ? '#b91c1c' : '#ef4444';
    if (props.isPrimary) return props.darkMode ? '#0369a1' : '#0ea5e9';
    return 'transparent';
  }};
  
  color: ${props => {
    if (props.isDanger || props.isPrimary) return 'white';
    return props.darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)';
  }};
  
  border: ${props => (!props.isPrimary && !props.isDanger) 
    ? `1px solid ${props.darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}` 
    : 'none'};
  
  &:hover {
    background-color: ${props => {
      if (props.isDanger) return props.darkMode ? '#a12727' : '#dc2626';
      if (props.isPrimary) return props.darkMode ? '#0284c7' : '#0284c7';
      return props.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    }};
    transform: ${props => (props.isPrimary || props.isDanger) ? 'translateY(-2px)' : 'none'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  darkMode,
  type = 'info'
}) => {
  if (!isOpen) return null;
  
  return (
    <Overlay isOpen={isOpen} onClick={onCancel}>
      <DialogContainer 
        darkMode={darkMode} 
        onClick={e => e.stopPropagation()}
      >
        <DialogHeader darkMode={darkMode} type={type}>
          <DialogIcon type={type}>{getIcon(type)}</DialogIcon>
          <DialogTitle darkMode={darkMode} type={type}>{title}</DialogTitle>
        </DialogHeader>
        
        <DialogContent darkMode={darkMode}>
          {message}
        </DialogContent>
        
        <DialogActions theme={{ darkMode }}>
          <Button 
            darkMode={darkMode} 
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          
          <Button 
            darkMode={darkMode} 
            isPrimary={type !== 'danger'}
            isDanger={type === 'danger'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogActions>
      </DialogContainer>
    </Overlay>
  );
};

export default ConfirmDialog; 