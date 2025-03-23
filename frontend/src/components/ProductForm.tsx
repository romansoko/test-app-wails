import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  status: string;
}

interface ProductFormProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
  isEditing: boolean;
  darkMode: boolean;
}

const FormContainer = styled.div<{ darkMode: boolean }>`
  background-color: ${props => props.darkMode ? 'var(--color-surface-dark)' : 'var(--color-surface-light)'};
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-md);
  margin-bottom: 24px;
  border: 1px solid ${props => props.darkMode ? 'var(--color-border-dark)' : 'var(--color-border-light)'};
  animation: slideDown 0.3s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FormTitle = styled.h3<{ darkMode: boolean }>`
  margin-top: 0;
  margin-bottom: 24px;
  color: ${props => props.darkMode ? 'var(--color-text-dark)' : 'var(--color-text-light)'};
  font-size: 1.25rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 12px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: var(--color-primary);
    border-radius: var(--border-radius-full);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label<{ darkMode: boolean }>`
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.darkMode ? 'var(--color-text-muted-dark)' : 'var(--color-text-muted-light)'};
`;

const Input = styled.input<{ darkMode: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  border: 1px solid ${props => props.darkMode ? 'var(--color-border-dark)' : 'var(--color-border-light)'};
  background-color: ${props => props.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'var(--color-surface-light)'};
  color: ${props => props.darkMode ? 'var(--color-text-dark)' : 'var(--color-text-light)'};
  font-size: 1rem;
  transition: all var(--transition-normal);
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? 'var(--color-primary-light)' : 'var(--color-primary)'};
    box-shadow: 0 0 0 3px ${props => props.darkMode ? 'rgba(128, 226, 126, 0.15)' : 'rgba(76, 175, 80, 0.15)'};
  }
`;

const TextArea = styled.textarea<{ darkMode: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  border: 1px solid ${props => props.darkMode ? 'var(--color-border-dark)' : 'var(--color-border-light)'};
  background-color: ${props => props.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'var(--color-surface-light)'};
  color: ${props => props.darkMode ? 'var(--color-text-dark)' : 'var(--color-text-light)'};
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  transition: all var(--transition-normal);
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? 'var(--color-primary-light)' : 'var(--color-primary)'};
    box-shadow: 0 0 0 3px ${props => props.darkMode ? 'rgba(128, 226, 126, 0.15)' : 'rgba(76, 175, 80, 0.15)'};
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Button = styled.button<{ darkMode: boolean, isPrimary?: boolean }>`
  padding: 12px 20px;
  border-radius: var(--border-radius-md);
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  background-color: ${props => props.isPrimary 
    ? 'var(--color-primary)' 
    : 'transparent'};
  color: ${props => props.isPrimary 
    ? 'white' 
    : (props.darkMode ? 'var(--color-text-dark)' : 'var(--color-text-light)')};
  border: ${props => props.isPrimary 
    ? 'none' 
    : `1px solid ${props.darkMode ? 'var(--color-border-dark)' : 'var(--color-border-light)'}`};
  
  &:hover {
    background-color: ${props => props.isPrimary 
      ? 'var(--color-primary-dark)' 
      : (props.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)')};
    transform: ${props => props.isPrimary ? 'translateY(-2px)' : 'none'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ErrorText = styled.div`
  color: var(--color-error);
  font-size: 0.85rem;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '⚠️';
    font-size: 0.85rem;
  }
`;

const Select = styled.select<{ darkMode: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  border: 1px solid ${props => props.darkMode ? 'var(--color-border-dark)' : 'var(--color-border-light)'};
  background-color: ${props => props.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'var(--color-surface-light)'};
  color: ${props => props.darkMode ? 'var(--color-text-dark)' : 'var(--color-text-light)'};
  font-size: 1rem;
  transition: all var(--transition-normal);
  appearance: none;
  background-image: ${props => props.darkMode
    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2.5 4.5L6 8L9.5 4.5' stroke='rgba(255, 255, 255, 0.6)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
    : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2.5 4.5L6 8L9.5 4.5' stroke='rgba(0, 0, 0, 0.6)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`};
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? 'var(--color-primary-light)' : 'var(--color-primary)'};
    box-shadow: 0 0 0 3px ${props => props.darkMode ? 'rgba(128, 226, 126, 0.15)' : 'rgba(76, 175, 80, 0.15)'};
  }
  
  option {
    background-color: ${props => props.darkMode ? '#1a1a1a' : '#fff'};
    color: ${props => props.darkMode ? '#fff' : '#333'};
  }
`;

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel,
  isEditing,
  darkMode
}) => {
  const [formData, setFormData] = useState<Product>({...product});
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    setFormData({...product});
  }, [product]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validate = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
    }
  };
  
  return (
    <FormContainer darkMode={darkMode}>
      <FormTitle darkMode={darkMode}>
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </FormTitle>
      
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <FormGroup>
            <Label darkMode={darkMode} htmlFor="name">Product Name</Label>
            <Input
              darkMode={darkMode}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </FormGroup>
          
          <FormGroup>
            <Label darkMode={darkMode} htmlFor="price">Price (₪)</Label>
            <Input
              darkMode={darkMode}
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
              min="0"
              step="0.01"
            />
            {errors.price && <ErrorText>{errors.price}</ErrorText>}
          </FormGroup>
          
          <FormGroup>
            <Label darkMode={darkMode} htmlFor="status">Status</Label>
            <Select
              darkMode={darkMode}
              id="status"
              name="status"
              value={formData.status || 'In Stock'}
              onChange={handleChange}
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </Select>
          </FormGroup>
        </FormGrid>
        
        <FormGroup>
          <Label darkMode={darkMode} htmlFor="description">Description</Label>
          <TextArea
            darkMode={darkMode}
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows={4}
          />
        </FormGroup>
        
        <FormActions>
          <Button 
            type="button" 
            onClick={onCancel}
            darkMode={darkMode}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            isPrimary
            darkMode={darkMode}
          >
            {isEditing ? 'Update' : 'Save'} Product
          </Button>
        </FormActions>
      </form>
    </FormContainer>
  );
};

export default ProductForm; 