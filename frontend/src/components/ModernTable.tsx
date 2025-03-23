import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface ModernTableProps {
  darkMode: boolean;
  headers: string[];
  rows: ReactNode[][];
  headerCellClass?: string[];
  bodyCellClass?: string[];
  emptyMessage?: string;
  maxHeight?: string;
}

const TableContainer = styled.div<{ darkMode: boolean, maxHeight?: string }>`
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: ${props => props.darkMode 
    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))'
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(248, 250, 252, 0.85))'};
  backdrop-filter: blur(12px);
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)'};
  box-shadow: 0 10px 30px ${props => props.darkMode 
    ? 'rgba(0, 0, 0, 0.5)' 
    : 'rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  max-height: ${props => props.maxHeight || 'none'};
  position: relative;
  z-index: 1;
  transform: translateZ(0);
  
  &:hover {
    box-shadow: 0 15px 40px ${props => props.darkMode 
      ? 'rgba(0, 0, 0, 0.6)' 
      : 'rgba(0, 0, 0, 0.15)'};
    transform: translateY(-5px);
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => props.darkMode 
      ? 'linear-gradient(to right, rgba(14, 165, 233, 0.08), rgba(2, 132, 199, 0.08))'
      : 'linear-gradient(to right, rgba(14, 165, 233, 0.05), rgba(2, 132, 199, 0.05))'};
    z-index: -1;
    opacity: 0;
    transition: opacity 0.4s ease;
    border-radius: 16px;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    height: 6px;
    background: linear-gradient(90deg, 
      #0284c7 0%, 
      #38bdf8 50%,
      #0284c7 100%);
    opacity: 0.8;
    border-radius: 16px 16px 0 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const ScrollContainer = styled.div<{ maxHeight?: string }>`
  overflow-x: auto;
  overflow-y: ${props => props.maxHeight ? 'auto' : 'visible'};
  max-height: ${props => props.maxHeight || 'none'};
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
    border: 2px solid transparent;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(155, 155, 155, 0.7);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const TableHead = styled.thead<{ darkMode: boolean }>`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${props => props.darkMode 
    ? 'linear-gradient(180deg, rgba(22, 32, 45, 0.98), rgba(15, 23, 42, 0.95))'
    : 'linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))'};
  backdrop-filter: blur(16px);
`;

const TableHeader = styled.th<{ darkMode: boolean }>`
  padding: 18px 24px;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)'};
  border-bottom: 2px solid ${props => props.darkMode 
    ? 'rgba(14, 165, 233, 0.25)' 
    : 'rgba(2, 132, 199, 0.2)'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:first-child {
    padding-left: 28px;
  }
  
  &:last-child {
    padding-right: 28px;
  }
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: ${props => props.darkMode
      ? 'linear-gradient(90deg, rgba(14, 165, 233, 0.8), rgba(56, 189, 248, 0.8))'
      : 'linear-gradient(90deg, rgba(2, 132, 199, 0.7), rgba(14, 165, 233, 0.7))'};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ darkMode: boolean }>`
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  
  &:hover {
    background-color: ${props => props.darkMode 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(66, 153, 225, 0.04)'};
    transform: translateX(6px);
    box-shadow: -10px 0 20px -15px ${props => props.darkMode 
      ? 'rgba(99, 179, 237, 0.4)' 
      : 'rgba(49, 130, 206, 0.3)'};
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const TableCell = styled.td<{ darkMode: boolean }>`
  padding: 18px 24px;
  font-size: 0.95rem;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
  border-bottom: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.07)' 
    : 'rgba(0, 0, 0, 0.05)'};
  line-height: 1.5;
  vertical-align: middle;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  
  &:first-child {
    padding-left: 28px;
    font-weight: 500;
  }
  
  &:last-child {
    padding-right: 28px;
  }
  
  /* Special styling for quantity cells */
  &.quantity-cell {
    input {
      background: ${props => props.darkMode 
        ? 'rgba(15, 23, 42, 0.6)' 
        : 'rgba(255, 255, 255, 0.95)'};
      border: 1px solid ${props => props.darkMode 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(0, 0, 0, 0.15)'};
      border-radius: 8px;
      padding: 10px;
      color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
      transition: all 0.2s ease;
      
      &:focus {
        box-shadow: 0 0 0 3px ${props => props.darkMode 
          ? 'rgba(56, 189, 248, 0.25)' 
          : 'rgba(2, 132, 199, 0.25)'};
        outline: none;
        border-color: ${props => props.darkMode 
          ? 'rgba(56, 189, 248, 0.5)' 
          : 'rgba(2, 132, 199, 0.5)'};
        transform: translateY(-2px);
      }
    }
  }
  
  /* Special styling for description cell */
  &.description-cell {
    color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
    font-style: italic;
    max-width: 300px;
    white-space: pre-line;
    line-height: 1.5;
    padding-right: 16px;
    
    div {
      white-space: pre-line !important;
      overflow: visible !important;
      text-overflow: clip !important;
      max-height: 120px;
      overflow-y: auto !important;
    }
  }
  
  /* Special styling for price and subtotal cells */
  &:nth-child(2), &:nth-child(4) {
    font-family: 'Monospace', 'Courier New', monospace;
    font-weight: 600;
    color: ${props => props.darkMode 
      ? 'rgba(56, 189, 248, 0.9)' 
      : 'rgba(2, 132, 199, 0.9)'};
    letter-spacing: 0.5px;
    text-shadow: 0 1px 1px ${props => props.darkMode 
      ? 'rgba(0, 0, 0, 0.4)' 
      : 'rgba(0, 0, 0, 0.1)'};
  }
  
  /* Special styling for action cells */
  &.action-cell {
    button {
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
      
      &:hover {
        transform: scale(1.2) rotate(5deg);
      }
    }
  }
  
  ${TableRow}:hover & {
    color: ${props => props.darkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.9)'};
  }
`;

const EmptyMessage = styled.div<{ darkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
  font-size: 1rem;
  font-style: italic;
  
  &::before {
    content: '📊';
    margin-right: 10px;
    font-size: 1.5rem;
    opacity: 0.6;
  }
`;

const ModernTable: React.FC<ModernTableProps> = ({
  darkMode,
  headers,
  rows,
  headerCellClass = [],
  bodyCellClass = [],
  emptyMessage = "No data available",
  maxHeight
}) => {
  // Ensure at least 6 rows are displayed
  const minRows = 6;
  const displayRows = [...rows];
  
  // If we have fewer than 6 rows, add empty rows to reach minRows
  if (rows.length > 0 && rows.length < minRows) {
    const emptyCells = Array(headers.length).fill('');
    for (let i = rows.length; i < minRows; i++) {
      displayRows.push(emptyCells);
    }
  }
  
  return (
    <TableContainer darkMode={darkMode} maxHeight={maxHeight}>
      <ScrollContainer maxHeight={maxHeight}>
        <Table>
          <TableHead darkMode={darkMode}>
            <tr>
              {headers.map((header, index) => (
                <TableHeader 
                  key={index} 
                  darkMode={darkMode}
                  className={headerCellClass[index] || ''}
                >
                  {header}
                </TableHeader>
              ))}
            </tr>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              displayRows.map((row, rowIndex) => (
                <TableRow key={rowIndex} darkMode={darkMode}>
                  {row.map((cell, cellIndex) => (
                    <TableCell 
                      key={cellIndex} 
                      darkMode={darkMode}
                      className={bodyCellClass[cellIndex] || ''}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length}>
                  <EmptyMessage darkMode={darkMode}>
                    {emptyMessage}
                  </EmptyMessage>
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </ScrollContainer>
    </TableContainer>
  );
};

export default ModernTable; 