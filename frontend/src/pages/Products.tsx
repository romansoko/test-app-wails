import React, { useState } from 'react';
import styled from 'styled-components';
import { AddProduct, UpdateProduct, DeleteProduct } from '../../wailsjs/go/main/App';
import ProductForm from '../components/ProductForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { main } from '../../wailsjs/go/models';
import { formatPrice } from '../utils/formatters';

// Use the Product type directly from the backend models
type Product = main.Product;

interface ProductsProps {
  products: Product[];
  darkMode: boolean;
  onProductsChanged: () => void;
  showNotification: (options: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

const emptyProduct: Product = {
  id: '',
  name: '',
  price: 0,
  description: '',
  status: 'In Stock'
};

const ProductsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const SearchBox = styled.input<{ darkMode: boolean }>`
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  border: 1px solid ${props => props.darkMode ? 'var(--color-border-dark)' : 'var(--color-border-light)'};
  background-color: ${props => props.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'var(--color-surface-light)'};
  color: ${props => props.darkMode ? 'var(--color-text-dark)' : 'var(--color-text-light)'};
  width: 300px;
  font-size: 0.9rem;
  transition: all var(--transition-normal);
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? 'var(--color-primary-light)' : 'var(--color-primary)'};
    box-shadow: 0 0 0 3px ${props => props.darkMode ? 'rgba(128, 226, 126, 0.15)' : 'rgba(76, 175, 80, 0.15)'};
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const AddButton = styled.button<{ darkMode: boolean }>`
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  border: none;
  background-color: var(--color-primary);
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
`;

const ProductCard = styled.div<{ darkMode: boolean }>`
  background: ${props => props.darkMode 
    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))' 
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))'};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  backdrop-filter: blur(12px);
  border: 1px solid ${props => props.darkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)'};
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 10px 30px ${props => props.darkMode 
    ? 'rgba(0, 0, 0, 0.3)' 
    : 'rgba(0, 0, 0, 0.1)'};
    
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px ${props => props.darkMode 
      ? 'rgba(0, 0, 0, 0.4)' 
      : 'rgba(0, 0, 0, 0.15)'};
      
    ${ActionButtons} {
      opacity: 1;
    }
  }
`;

const ProductContent = styled.div`
  padding: 20px;
`;

const ProductName = styled.h3<{ darkMode: boolean }>`
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'};
`;

const ProductDesc = styled.p<{ darkMode: boolean }>`
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
  line-height: 1.5;
  height: 60px;
  overflow-y: auto;
  white-space: pre-line;
`;

const ProductPrice = styled.div<{ darkMode: boolean }>`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.darkMode ? 'rgba(56, 189, 248, 0.9)' : 'rgba(2, 132, 199, 0.9)'};
  margin-bottom: 16px;
`;

const StockDropdown = styled.select<{ darkMode: boolean; status: string }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 1em;
  padding-right: 30px;
  cursor: pointer;
  
  /* Status-based styling */
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
  
  border: 1px solid ${props => {
    if (props.status === 'In Stock') {
      return props.darkMode ? 'rgba(22, 163, 74, 0.3)' : 'rgba(22, 163, 74, 0.2)';
    } else if (props.status === 'Low Stock') {
      return props.darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)';
    } else {
      return props.darkMode ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.2)';
    }
  }};
  
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => {
      if (props.status === 'In Stock') {
        return props.darkMode ? 'rgba(22, 163, 74, 0.3)' : 'rgba(22, 163, 74, 0.2)';
      } else if (props.status === 'Low Stock') {
        return props.darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)';
      } else {
        return props.darkMode ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.2)';
      }
    }};
  }
  
  option {
    background-color: ${props => props.darkMode ? '#1e293b' : '#ffffff'};
    color: ${props => props.darkMode ? '#ffffff' : '#000000'};
  }
`;

const ActionButton = styled.button<{ darkMode: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-full);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  font-size: 1.1rem;
  
  &.edit {
    background-color: ${props => props.darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'};
    color: var(--color-info);
  }
  
  &.delete {
    background-color: ${props => props.darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'};
    color: var(--color-error);
  }
  
  &.edit:hover {
    background-color: var(--color-info);
    color: white;
    transform: scale(1.1);
  }
  
  &.delete:hover {
    background-color: var(--color-error);
    color: white;
    transform: scale(1.1) rotate(5deg);
  }
`;

const NoProductsMessage = styled.div<{ darkMode: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  border-radius: var(--border-radius-lg);
  background-color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'};
  border: 1px dashed ${props => props.darkMode ? 'var(--color-border-dark)' : 'var(--color-border-light)'};
  grid-column: 1 / -1;
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    color: ${props => props.darkMode ? 'var(--color-text-muted-dark)' : 'var(--color-text-muted-light)'};
  }
  
  p {
    font-size: 1.1rem;
    color: ${props => props.darkMode ? 'var(--color-text-muted-dark)' : 'var(--color-text-muted-light)'};
  }
`;

const Products: React.FC<ProductsProps> = ({
  products,
  darkMode,
  onProductsChanged,
  showNotification
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>({...emptyProduct});
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddProduct = () => {
    setCurrentProduct({...emptyProduct});
    setIsAdding(true);
    setIsEditing(false);
  };
  
  const handleEditProduct = (product: Product) => {
    setCurrentProduct({...product});
    setIsEditing(true);
    setIsAdding(false);
  };
  
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsConfirmDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      console.log('Deleting product with ID:', productToDelete.id);
      const success = await DeleteProduct(productToDelete.id);
      console.log('Delete product response:', success);
      
      if (success) {
        showNotification({
          message: `${productToDelete.name} נמחק בהצלחה`,
          type: 'success'
        });
        onProductsChanged();
      } else {
        console.error('Delete product returned false');
        showNotification({
          message: `נכשל במחיקת ${productToDelete.name}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification({
        message: `שגיאה במחיקת מוצר: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`,
        type: 'error'
      });
    } finally {
      setIsConfirmDialogOpen(false);
      setProductToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setIsConfirmDialogOpen(false);
    setProductToDelete(null);
  };
  
  const handleSaveProduct = async (product: Product) => {
    try {
      let success;
      
      if (isEditing) {
        success = await UpdateProduct(product);
      } else {
        success = await AddProduct(product);
      }
      
      if (success) {
        showNotification({
          message: isEditing 
            ? 'המוצר עודכן בהצלחה' 
            : 'המוצר נוסף בהצלחה', 
          type: 'success'
        });
        setIsAdding(false);
        setIsEditing(false);
        onProductsChanged();
      } else {
        showNotification({
          message: isEditing 
            ? 'נכשל בעדכון המוצר' 
            : 'נכשל בהוספת המוצר', 
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification({
        message: 'שגיאה בשמירת המוצר',
        type: 'error'
      });
    }
  };
  
  const handleCancelForm = () => {
    setIsAdding(false);
    setIsEditing(false);
  };
  
  const handleStatusChange = async (product: Product, newStatus: string) => {
    try {
      const updatedProduct = { ...product, status: newStatus };
      await UpdateProduct(updatedProduct);
      onProductsChanged();
      showNotification({
        message: `סטטוס המוצר עודכן ל-${newStatus}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      showNotification({
        message: 'שגיאה בעדכון סטטוס המוצר',
        type: 'error'
      });
    }
  };
  
  return (
    <ProductsContainer>
      <ProductsHeader>
        <SearchBox 
          darkMode={darkMode}
          placeholder="חיפוש לפי שם או תיאור..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <AddButton 
          darkMode={darkMode}
          onClick={handleAddProduct}
        >
          <span>+</span> הוסף מוצר חדש
        </AddButton>
      </ProductsHeader>
      
      {(isAdding || isEditing) && (
        <ProductForm
          product={currentProduct}
          onSave={handleSaveProduct}
          onCancel={handleCancelForm}
          isEditing={isEditing}
          darkMode={darkMode}
        />
      )}
      
      {!isAdding && !isEditing && (
        <ProductGrid>
          {filteredProducts.length === 0 ? (
            <NoProductsMessage darkMode={darkMode}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>אין מוצרים</p>
            </NoProductsMessage>
          ) : (
            filteredProducts.map(product => (
              <ProductCard key={product.id} darkMode={darkMode}>
                <ProductContent>
                  <ProductName darkMode={darkMode}>{product.name}</ProductName>
                  <ProductPrice darkMode={darkMode}>{formatPrice(product.price)}</ProductPrice>
                  <ProductDesc darkMode={darkMode}>{product.description}</ProductDesc>
                  <StockDropdown 
                    darkMode={darkMode}
                    status={product.status || 'In Stock'}
                    value={product.status || 'In Stock'}
                    onChange={(e) => handleStatusChange(product, e.target.value)}
                  >
                    <option value="In Stock">במלאי</option>
                    <option value="Low Stock">מלאי נמוך</option>
                    <option value="Out of Stock">אזל</option>
                  </StockDropdown>
                </ProductContent>
                
                <ActionButtons>
                  <ActionButton 
                    className="edit"
                    darkMode={darkMode}
                    onClick={() => handleEditProduct(product)}
                    aria-label="ערוך מוצר"
                  >
                    ✏️
                  </ActionButton>
                  
                  <ActionButton 
                    className="delete"
                    darkMode={darkMode}
                    onClick={() => handleDeleteClick(product)}
                    aria-label="מחק מוצר"
                  >
                    🗑️
                  </ActionButton>
                </ActionButtons>
              </ProductCard>
            ))
          )}
        </ProductGrid>
      )}
      
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="אישור מחיקה"
        message={`האם אתה בטוח שברצונך למחוק את "${productToDelete?.name}"? פעולה זו אינה ניתנת לביטול.`}
        confirmText="מחק"
        cancelText="ביטול"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        darkMode={darkMode}
        type="danger"
      />
    </ProductsContainer>
  );
};

export default Products; 