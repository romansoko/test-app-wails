import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GetStockItems, AddStockItem, UpdateStockItem, DeleteStockItem } from '../../wailsjs/go/main/App';
import { main } from '../../wailsjs/go/models';

// Import the base StockItem type
type BackendStockItem = main.StockItem;

// Extended version for our frontend
interface StockItemData extends BackendStockItem {
  minQuantity: number;
  unit: string;
}

interface StockProps {
  darkMode: boolean;
  showNotification: (options: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

// Styled components
const PageContainer = styled.div`
  padding: 24px;
  height: 100%;
  overflow-y: auto;
`;

const PageHeader = styled.div<{ darkMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  
  h1 {
    font-size: 24px;
    margin: 0;
    color: ${props => props.darkMode ? '#fff' : '#1e293b'};
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StockPanel = styled.div<{ darkMode: boolean }>`
  background: ${props => props.darkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(248, 250, 252, 0.8)'};
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 6px ${props => props.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
`;

const SectionTitle = styled.h2<{ darkMode: boolean }>`
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 16px;
  color: ${props => props.darkMode ? '#fff' : '#1e293b'};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
`;

const SearchBox = styled.input<{ darkMode: boolean }>`
  background: ${props => props.darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)'};
  border: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 4px;
  padding: 8px 16px;
  color: ${props => props.darkMode ? '#fff' : '#1e293b'};
  width: 300px;
  max-width: 100%;
  
  &::placeholder {
    color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? '#3b82f6' : '#3b82f6'};
    box-shadow: 0 0 0 2px ${props => props.darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
  }
`;

const AddButton = styled.button<{ darkMode: boolean }>`
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const StockItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 24px;
  margin-top: 24px;
`;

const StockItemCard = styled.div<{ darkMode: boolean }>`
  background: ${props => props.darkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 8px;
  padding: 16px;
  border: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px ${props => props.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
  
  h3 {
    margin-top: 0;
    margin-bottom: 8px;
    color: ${props => props.darkMode ? '#fff' : '#1e293b'};
  }
  
  p {
    margin-top: 0;
    margin-bottom: 16px;
    color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
    font-size: 0.9rem;
  }
`;

const QuantityIndicator = styled.div<{ darkMode: boolean; low: boolean; empty: boolean }>`
  background: ${props => {
    if (props.empty) return props.darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)';
    if (props.low) return props.darkMode ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)';
    return props.darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)';
  }};
  color: ${props => {
    if (props.empty) return props.darkMode ? '#f87171' : '#ef4444';
    if (props.low) return props.darkMode ? '#fcd34d' : '#eab308';
    return props.darkMode ? '#86efac' : '#22c55e';
  }};
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LowStockLabel = styled.span`
  background: #eab308;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
`;

const OutOfStockLabel = styled.span`
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
`;

const EditButton = styled.button<{ darkMode: boolean; variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  background: ${props => props.variant === 'primary' ? '#3b82f6' : 
    props.variant === 'danger' ? '#ef4444' : 
    props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
  };
  color: ${props => (props.variant === 'primary' || props.variant === 'danger') ? 'white' : 
    props.darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'
  };
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#2563eb' : 
      props.variant === 'danger' ? '#dc2626' : 
      props.darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
    };
  }
`;

const DeleteButton = styled(EditButton)`
  background: ${props => props.darkMode ? 'rgba(239, 68, 68, 0.8)' : '#ef4444'};
  color: white;
  
  &:hover {
    background: ${props => props.darkMode ? 'rgba(220, 38, 38, 0.9)' : '#dc2626'};
  }
`;

const LoadingMessage = styled.div<{ darkMode: boolean }>`
  padding: 24px;
  text-align: center;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'};
  font-size: 1.1rem;
`;

const NoItemsMessage = styled.div<{ darkMode: boolean }>`
  padding: 24px;
  text-align: center;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'};
  font-size: 1.1rem;
`;

const Modal = styled.div<{ darkMode: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div<{ darkMode: boolean }>`
  background: ${props => props.darkMode ? '#1e293b' : '#fff'};
  border-radius: 8px;
  padding: 24px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h2 {
    font-size: 20px;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
  }
  
  input, textarea {
    width: 100%;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
    }
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const SaveButton = styled.button<{ darkMode: boolean }>`
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #2563eb;
  }
`;

const CancelButton = styled.button<{ darkMode: boolean }>`
  background: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'};
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const ConfirmModal = styled(Modal)``;

const ConfirmModalContent = styled(ModalContent)`
  width: 400px;
  text-align: center;
  
  h2 {
    margin-top: 0;
  }
  
  p {
    margin-bottom: 24px;
  }
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
  const [formData, setFormData] = useState<StockItemData>({
    id: '',
    name: '',
    description: '',
    quantity: 0,
    minQuantity: 5,
    unit: 'יחידות'
  });
  
  const loadStockItems = async () => {
    try {
      setLoading(true);
      const data = await GetStockItems();
      
      if (Array.isArray(data)) {
        // Convert the data to ensure minQuantity and unit are set
        const itemsWithDefaults = data.map(item => ({
          ...item,
          minQuantity: (item as any).minQuantity !== undefined ? (item as any).minQuantity : 5,
          unit: (item as any).unit || 'יחידות'
        })) as StockItemData[];
        
        setStockItems(itemsWithDefaults);
        setFilteredItems(itemsWithDefaults);
      } else {
        setStockItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error('Error loading stock items:', error);
      showNotification({
        message: 'שגיאה בטעינת פריטי המלאי',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter items when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(stockItems);
      return;
    }
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = stockItems.filter(item => 
      item.name.toLowerCase().includes(lowerCaseSearchTerm) || 
      (item.description && item.description.toLowerCase().includes(lowerCaseSearchTerm))
    );
    
    setFilteredItems(filtered);
  }, [searchTerm, stockItems]);
  
  // Load items on mount
  useEffect(() => {
    loadStockItems();
  }, []);
  
  const handleAddItem = () => {
    setIsEditing(false);
    setCurrentItem(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      quantity: 0,
      minQuantity: 5,
      unit: 'יחידות'
    });
    setShowAddEditModal(true);
  };

  const handleEditItem = (item: StockItemData, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setIsEditing(true);
    setCurrentItem(item);
    setFormData({
      ...item
    });
    setShowAddEditModal(true);
  };

  const handleDeletePrompt = (item: StockItemData, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setCurrentItem(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    
    try {
      const success = await DeleteStockItem(currentItem.id);
      
      if (success) {
        showNotification({
          message: 'הפריט נמחק בהצלחה',
          type: 'success'
        });
        
        await loadStockItems();
      } else {
        showNotification({
          message: 'שגיאה במחיקת הפריט',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting stock item:', error);
      showNotification({
        message: 'אירעה שגיאה במחיקת הפריט',
        type: 'error'
      });
    } finally {
      setShowDeleteModal(false);
      setCurrentItem(null);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'quantity' || name === 'minQuantity') {
      // Convert string value to number for numeric fields
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name) {
      showNotification({
        message: 'נא להזין שם לפריט',
        type: 'warning'
      });
      return;
    }
    
    if (formData.quantity < 0) {
      showNotification({
        message: 'הכמות לא יכולה להיות שלילית',
        type: 'warning'
      });
      return;
    }
    
    try {
      if (isEditing && currentItem) {
        // Update existing item - only pass the fields the backend expects
        const updatedItem: BackendStockItem = {
          id: currentItem.id,
          name: formData.name,
          description: formData.description,
          quantity: formData.quantity
        };
        
        // Save the extra fields we need in a separate storage if needed
        // For example, localStorage or a separate API call
        
        const success = await UpdateStockItem(updatedItem);
        
        if (success) {
          showNotification({
            message: 'הפריט עודכן בהצלחה',
            type: 'success'
          });
          
          await loadStockItems();
        } else {
          showNotification({
            message: 'שגיאה בעדכון הפריט',
            type: 'error'
          });
        }
      } else {
        // Add new item - only pass the fields the backend expects
        const newItem: BackendStockItem = {
          id: formData.id || '',
          name: formData.name,
          description: formData.description,
          quantity: formData.quantity
        };
        
        // Save the extra fields we need in a separate storage if needed
        
        const result = await AddStockItem(newItem);
        
        if (result && result.id) {
          showNotification({
            message: 'הפריט נוסף בהצלחה',
            type: 'success'
          });
          
          await loadStockItems();
        } else {
          showNotification({
            message: 'שגיאה בהוספת הפריט',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error saving stock item:', error);
      showNotification({
        message: 'אירעה שגיאה בשמירת הפריט',
        type: 'error'
      });
    } finally {
      setShowAddEditModal(false);
      setCurrentItem(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader darkMode={darkMode}>
        <h1>ניהול מלאי</h1>
        <SearchBox 
          type="text" 
          placeholder="חיפוש פריטים..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          darkMode={darkMode}
        />
        <AddButton onClick={handleAddItem} darkMode={darkMode}>
          הוסף פריט
        </AddButton>
      </PageHeader>
      
      <StockPanel darkMode={darkMode}>
        <SectionTitle darkMode={darkMode}>פריטי מלאי</SectionTitle>
        
        {loading ? (
          <LoadingMessage darkMode={darkMode}>טוען...</LoadingMessage>
        ) : filteredItems.length === 0 ? (
          <NoItemsMessage darkMode={darkMode}>לא נמצאו פריטים</NoItemsMessage>
        ) : (
          <StockItemsGrid>
            {filteredItems.map((item) => (
              <StockItemCard key={item.id} darkMode={darkMode}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <QuantityIndicator 
                  low={item.quantity <= item.minQuantity} 
                  empty={item.quantity === 0}
                  darkMode={darkMode}
                >
                  <span>{item.quantity} {item.unit}</span>
                  {item.quantity <= item.minQuantity && item.quantity > 0 && (
                    <LowStockLabel>מלאי נמוך</LowStockLabel>
                  )}
                  {item.quantity === 0 && (
                    <OutOfStockLabel>אזל מהמלאי</OutOfStockLabel>
                  )}
                </QuantityIndicator>
                <ActionButtons>
                  <EditButton 
                    darkMode={darkMode} 
                    variant="primary"
                    onClick={(e) => handleEditItem(item, e)}
                  >
                    עריכה
                  </EditButton>
                  <DeleteButton 
                    darkMode={darkMode} 
                    variant="danger"
                    onClick={(e) => handleDeletePrompt(item, e)}
                  >
                    מחיקה
                  </DeleteButton>
                </ActionButtons>
              </StockItemCard>
            ))}
          </StockItemsGrid>
        )}
      </StockPanel>

      {/* Add/Edit Modal */}
      {showAddEditModal && (
        <Modal darkMode={darkMode}>
          <ModalContent darkMode={darkMode}>
            <ModalHeader>
              <h2>{isEditing ? 'עריכת פריט' : 'הוספת פריט חדש'}</h2>
              <CloseButton onClick={() => setShowAddEditModal(false)}>×</CloseButton>
            </ModalHeader>
            <form onSubmit={handleSubmitForm}>
              <FormGroup>
                <label htmlFor="name">שם הפריט</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label htmlFor="description">תיאור</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </FormGroup>
              <FormGroup>
                <label htmlFor="quantity">כמות</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  min="0"
                />
              </FormGroup>
              <FormGroup>
                <label htmlFor="minQuantity">כמות מינימלית להתראה</label>
                <input
                  type="number"
                  id="minQuantity"
                  name="minQuantity"
                  value={formData.minQuantity}
                  onChange={handleFormChange}
                  min="0"
                />
              </FormGroup>
              <FormGroup>
                <label htmlFor="unit">יחידת מידה</label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleFormChange}
                />
              </FormGroup>
              <ButtonGroup>
                <SaveButton type="submit" darkMode={darkMode}>
                  {isEditing ? 'עדכן פריט' : 'הוסף פריט'}
                </SaveButton>
                <CancelButton 
                  type="button" 
                  onClick={() => setShowAddEditModal(false)}
                  darkMode={darkMode}
                >
                  ביטול
                </CancelButton>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentItem && (
        <ConfirmModal darkMode={darkMode}>
          <ConfirmModalContent darkMode={darkMode}>
            <h2>אישור מחיקה</h2>
            <p>האם אתה בטוח שברצונך למחוק את {currentItem.name}?</p>
            <ButtonGroup>
              <DeleteButton 
                onClick={handleDeleteConfirm}
                darkMode={darkMode}
              >
                מחק
              </DeleteButton>
              <CancelButton 
                onClick={() => setShowDeleteModal(false)}
                darkMode={darkMode}
              >
                ביטול
              </CancelButton>
            </ButtonGroup>
          </ConfirmModalContent>
        </ConfirmModal>
      )}
    </PageContainer>
  );
};

export default Stock; 