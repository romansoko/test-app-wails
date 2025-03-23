import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { GetStockItems, AddStockItem, UpdateStockItem, DeleteStockItem } from '../../wailsjs/go/main/App';

interface StockItemData {
  id: string;
  name: string;
  description: string;
  quantity: number;
}

interface StockProps {
  darkMode: boolean;
  showNotification: (options: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

// Styled components - reusing the same styling approach
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

const StockPanel = styled(GlassPanel)`
  padding: 24px;
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

// Additional styled components for search and item list
const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.input<{ darkMode: boolean }>`
  background: ${props => props.darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)'};
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
  border: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  flex: 1;
  min-width: 200px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.darkMode ? 'rgba(56, 189, 248, 0.5)' : 'rgba(14, 165, 233, 0.5)'};
  }
  
  &::placeholder {
    color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
  }
`;

const StockItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StockItemCard = styled(GlassPanel)<{ darkMode: boolean; lowStock?: boolean }>`
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
  
  ${props => props.lowStock && `
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      border: 2px solid ${props.darkMode ? 'rgba(220, 38, 38, 0.5)' : 'rgba(220, 38, 38, 0.5)'};
    }
  `}
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StockItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ItemName = styled.div<{ darkMode: boolean }>`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'};
  max-width: 200px;
  word-break: break-word;
`;

const ItemDescription = styled.div<{ darkMode: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  margin-top: 4px;
  max-width: 100%;
  word-break: break-word;
`;

const QuantityBadge = styled.div<{ darkMode: boolean; lowStock?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.lowStock
    ? (props.darkMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)')
    : (props.darkMode ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)')
  };
  color: ${props => props.lowStock
    ? (props.darkMode ? 'rgba(248, 113, 113, 0.9)' : 'rgba(220, 38, 38, 0.9)')
    : (props.darkMode ? 'rgba(134, 239, 172, 0.9)' : 'rgba(22, 163, 74, 0.9)')
  };
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const ItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionIconButton = styled.button<{ darkMode: boolean; variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.darkMode 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(255, 255, 255, 0.7)'};
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => {
    switch (props.variant) {
      case 'danger':
        return props.darkMode ? 'rgba(248, 113, 113, 0.9)' : 'rgba(220, 38, 38, 0.9)';
      case 'primary':
        return props.darkMode ? 'rgba(56, 189, 248, 0.9)' : 'rgba(14, 165, 233, 0.9)';
      default:
        return props.darkMode ? 'rgba(203, 213, 225, 0.9)' : 'rgba(100, 116, 139, 0.9)';
    }
  }};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  backdrop-filter: blur(8px);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  cursor: pointer;
  
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

const AddButton = styled.button<{ darkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${props => props.darkMode 
    ? 'linear-gradient(145deg, rgba(56, 189, 248, 0.8), rgba(14, 165, 233, 0.8))' 
    : 'linear-gradient(145deg, rgba(14, 165, 233, 0.8), rgba(2, 132, 199, 0.8))'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px ${props => props.darkMode 
    ? 'rgba(14, 165, 233, 0.3)' 
    : 'rgba(14, 165, 233, 0.2)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.darkMode 
      ? 'rgba(14, 165, 233, 0.4)' 
      : 'rgba(14, 165, 233, 0.3)'};
  }
`;

const EmptyMessage = styled.div<{ darkMode: boolean }>`
  text-align: center;
  padding: 40px 0;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
  font-size: 1.1rem;
`;

// Modal components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(GlassPanel)`
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label<{ darkMode: boolean }>`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'};
`;

const FormInput = styled.input<{ darkMode: boolean }>`
  width: 100%;
  background: ${props => props.darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)'};
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
  border: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.darkMode ? 'rgba(56, 189, 248, 0.5)' : 'rgba(14, 165, 233, 0.5)'};
  }
`;

const FormTextarea = styled.textarea<{ darkMode: boolean }>`
  width: 100%;
  background: ${props => props.darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)'};
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
  border: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.darkMode ? 'rgba(56, 189, 248, 0.5)' : 'rgba(14, 165, 233, 0.5)'};
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ darkMode: boolean; variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${props => {
    switch (props.variant) {
      case 'danger':
        return props.darkMode 
          ? 'linear-gradient(145deg, rgba(248, 113, 113, 0.8), rgba(220, 38, 38, 0.8))' 
          : 'linear-gradient(145deg, rgba(220, 38, 38, 0.8), rgba(185, 28, 28, 0.8))';
      case 'primary':
        return props.darkMode 
          ? 'linear-gradient(145deg, rgba(56, 189, 248, 0.8), rgba(14, 165, 233, 0.8))' 
          : 'linear-gradient(145deg, rgba(14, 165, 233, 0.8), rgba(2, 132, 199, 0.8))';
      default:
        return props.darkMode 
          ? 'rgba(30, 41, 59, 0.5)'
          : 'rgba(248, 250, 252, 0.8)';
    }
  }};
  
  color: ${props => {
    switch (props.variant) {
      case 'danger':
      case 'primary':
        return 'white';
      default:
        return props.darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
    }
  }};
  
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'danger':
      case 'primary':
        return 'transparent';
      default:
        return props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    }
  }};
  
  box-shadow: ${props => {
    switch (props.variant) {
      case 'danger':
        return props.darkMode 
          ? '0 4px 12px rgba(220, 38, 38, 0.3)' 
          : '0 4px 12px rgba(220, 38, 38, 0.2)';
      case 'primary':
        return props.darkMode 
          ? '0 4px 12px rgba(14, 165, 233, 0.3)' 
          : '0 4px 12px rgba(14, 165, 233, 0.2)';
      default:
        return 'none';
    }
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      switch (props.variant) {
        case 'danger':
          return props.darkMode 
            ? '0 6px 16px rgba(220, 38, 38, 0.4)' 
            : '0 6px 16px rgba(220, 38, 38, 0.3)';
        case 'primary':
          return props.darkMode 
            ? '0 6px 16px rgba(14, 165, 233, 0.4)' 
            : '0 6px 16px rgba(14, 165, 233, 0.3)';
        default:
          return props.darkMode 
            ? '0 6px 16px rgba(0, 0, 0, 0.2)' 
            : '0 6px 16px rgba(0, 0, 0, 0.1)';
      }
    }};
  }
`;

// Delete Confirmation Modal
const DeleteModal = styled(ModalContent)`
  max-width: 400px;
`;

const DeleteModalText = styled.p<{ darkMode: boolean }>`
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};
  margin-bottom: 24px;
`;

// Main component
const Stock: React.FC<StockProps> = ({ darkMode, showNotification }) => {
  const [stockItems, setStockItems] = useState<StockItemData[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockItemData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Modal states
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<StockItemData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Form states
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    description: string;
    quantity: number;
  }>({
    id: '',
    name: '',
    description: '',
    quantity: 0
  });
  
  const loadStockItems = async () => {
    try {
      setLoading(true);
      const data = await GetStockItems();
      
      if (Array.isArray(data)) {
        setStockItems(data);
        setFilteredItems(data);
      } else {
        setStockItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error('Error loading stock items:', error);
      showNotification({
        message: 'Failed to load stock items',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadStockItems();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(stockItems);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = stockItems.filter(item => 
        item.name.toLowerCase().includes(lowercaseSearch) || 
        (item.description && item.description.toLowerCase().includes(lowercaseSearch))
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, stockItems]);
  
  const handleAddItem = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      name: '',
      description: '',
      quantity: 0
    });
    setShowAddEditModal(true);
  };
  
  const handleEditItem = (event: React.MouseEvent, item: StockItemData) => {
    event.stopPropagation();
    setIsEditing(true);
    setCurrentItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description || '',
      quantity: item?.quantity || 0
    });
    setShowAddEditModal(true);
  };
  
  const handleDeletePrompt = (event: React.MouseEvent, item: StockItemData) => {
    event.stopPropagation();
    setCurrentItem(item);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    
    try {
      const success = await DeleteStockItem(currentItem.id);
      
      if (success) {
        showNotification({
          message: 'Stock item deleted successfully',
          type: 'success'
        });
        
        await loadStockItems();
      } else {
        showNotification({
          message: 'Failed to delete stock item',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting stock item:', error);
      showNotification({
        message: 'An error occurred while deleting the stock item',
        type: 'error'
      });
    } finally {
      setShowDeleteModal(false);
      setCurrentItem(null);
    }
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' 
        ? parseFloat(value) || 0 
        : value
    }));
  };
  
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name) {
      showNotification({
        message: 'Please enter a name for the stock item',
        type: 'warning'
      });
      return;
    }
    
    if (formData.quantity < 0) {
      showNotification({
        message: 'Quantity cannot be negative',
        type: 'warning'
      });
      return;
    }
    
    try {
      if (isEditing && currentItem) {
        // Update existing item
        const updatedItem = {
          ...currentItem,
          name: formData.name,
          description: formData.description,
          quantity: formData.quantity
        };
        
        const success = await UpdateStockItem(updatedItem);
        
        if (success) {
          showNotification({
            message: 'Stock item updated successfully',
            type: 'success'
          });
          
          await loadStockItems();
        } else {
          showNotification({
            message: 'Failed to update stock item',
            type: 'error'
          });
        }
      } else {
        // Add new item
        const newItem = await AddStockItem({
          id: formData.id || '',
          name: formData.name,
          description: formData.description,
          quantity: formData.quantity
        });
        
        if (newItem && newItem.id) {
          showNotification({
            message: 'Stock item added successfully',
            type: 'success'
          });
          
          await loadStockItems();
        } else {
          showNotification({
            message: 'Failed to add stock item',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error saving stock item:', error);
      showNotification({
        message: 'An error occurred while saving the stock item',
        type: 'error'
      });
    } finally {
      setShowAddEditModal(false);
      setCurrentItem(null);
    }
  };
  
  // Create icon components properly
  const renderIcon = (Icon: any, size: number) => <Icon size={size} />;
  
  return (
    <PageContainer darkMode={darkMode}>
      <PageHeader darkMode={darkMode}>
        <h1>Stock Management</h1>
        <AddButton 
          darkMode={darkMode}
          onClick={handleAddItem}
        >
          {renderIcon(FaPlus, 14)}
          Add Stock Item
        </AddButton>
      </PageHeader>
      
      <StockPanel darkMode={darkMode}>
        <SectionTitle darkMode={darkMode}>Stock Items</SectionTitle>
        
        <FilterContainer>
          <SearchBox 
            type="text"
            placeholder="Search stock items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            darkMode={darkMode}
          />
        </FilterContainer>
        
        {loading ? (
          <EmptyMessage darkMode={darkMode}>Loading stock items...</EmptyMessage>
        ) : filteredItems.length > 0 ? (
          <StockItemGrid>
            {filteredItems.map(item => (
              <StockItemCard 
                key={item.id} 
                darkMode={darkMode}
                lowStock={item?.quantity <= 5}
              >
                <StockItemHeader>
                  <div>
                    <ItemName darkMode={darkMode}>{item.name}</ItemName>
                    {item.description && (
                      <ItemDescription darkMode={darkMode}>{item.description}</ItemDescription>
                    )}
                  </div>
                  <QuantityBadge 
                    darkMode={darkMode}
                    lowStock={item?.quantity <= 5}
                  >
                    {item?.quantity || 0} in stock
                  </QuantityBadge>
                </StockItemHeader>
                
                <ItemFooter>
                  <ActionButtonsContainer>
                    <ActionIconButton 
                      darkMode={darkMode} 
                      variant="primary"
                      onClick={(e) => handleEditItem(e, item)}
                    >
                      {renderIcon(FaEdit, 16)}
                    </ActionIconButton>
                    <ActionIconButton 
                      darkMode={darkMode} 
                      variant="danger"
                      onClick={(e) => handleDeletePrompt(e, item)}
                    >
                      {renderIcon(FaTrash, 16)}
                    </ActionIconButton>
                  </ActionButtonsContainer>
                </ItemFooter>
              </StockItemCard>
            ))}
          </StockItemGrid>
        ) : (
          <EmptyMessage darkMode={darkMode}>
            No stock items found. {searchTerm ? 'Try a different search term.' : 'Add your first stock item!'}
          </EmptyMessage>
        )}
      </StockPanel>
      
      {/* Add/Edit Modal */}
      {showAddEditModal && (
        <ModalOverlay onClick={() => setShowAddEditModal(false)}>
          <ModalContent 
            darkMode={darkMode}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <h2>{isEditing ? 'Edit Stock Item' : 'Add New Stock Item'}</h2>
            </ModalHeader>
            
            <form onSubmit={handleSubmitForm}>
              <FormGroup>
                <FormLabel darkMode={darkMode}>Name *</FormLabel>
                <FormInput 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  darkMode={darkMode}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel darkMode={darkMode}>Description</FormLabel>
                <FormTextarea 
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  darkMode={darkMode}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel darkMode={darkMode}>Quantity *</FormLabel>
                <FormInput 
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  darkMode={darkMode}
                  min="0"
                  step="0.01"
                />
              </FormGroup>
              
              <ButtonsContainer>
                <Button 
                  type="button"
                  darkMode={darkMode}
                  onClick={() => setShowAddEditModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  darkMode={darkMode}
                  variant="primary"
                >
                  {isEditing ? 'Update Item' : 'Add Item'}
                </Button>
              </ButtonsContainer>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentItem && (
        <ModalOverlay onClick={() => setShowDeleteModal(false)}>
          <DeleteModal 
            darkMode={darkMode}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <h2>Confirm Delete</h2>
            </ModalHeader>
            
            <DeleteModalText darkMode={darkMode}>
              Are you sure you want to delete <strong>{currentItem.name}</strong>? This action cannot be undone.
            </DeleteModalText>
            
            <ButtonsContainer>
              <Button 
                darkMode={darkMode}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                darkMode={darkMode}
                variant="danger"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </ButtonsContainer>
          </DeleteModal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Stock; 