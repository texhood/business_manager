import React from 'react';
import { useCart } from '../context/CartContext';

function ProductGrid({ products, loading }) {
  const { addItem } = useCart();

  const handleProductClick = (product) => {
    // Check if in stock (if tracking inventory)
    if (product.track_inventory && product.stock_quantity <= 0) {
      return;
    }
    addItem(product);
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getStockStatus = (product) => {
    if (!product.track_inventory) return null;
    
    if (product.stock_quantity <= 0) {
      return { text: 'Out of Stock', className: 'out' };
    }
    if (product.stock_quantity <= 5) {
      return { text: `Only ${product.stock_quantity} left`, className: 'low' };
    }
    return { text: `${product.stock_quantity} in stock`, className: '' };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading products...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="loading">
        <span>No products found</span>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map(product => {
        const stockStatus = getStockStatus(product);
        const isOutOfStock = product.track_inventory && product.stock_quantity <= 0;

        return (
          <div
            key={product.id}
            className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
            onClick={() => handleProductClick(product)}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="product-image"
              />
            ) : (
              <div className="product-image" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                📦
              </div>
            )}
            <div className="product-name">{product.display_name || product.name}</div>
            <div className="product-price">{formatPrice(product.price)}</div>
            {stockStatus && (
              <div className={`product-stock ${stockStatus.className}`}>
                {stockStatus.text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProductGrid;
