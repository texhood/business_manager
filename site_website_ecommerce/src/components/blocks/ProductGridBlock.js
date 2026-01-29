/**
 * Product Grid Block Component
 * Display products from the store
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import './blocks.css';

const ProductGridBlock = ({ content, settings }) => {
  const {
    title = '',
    subtitle = '',
    displayCount = 6,
    categorySlug = '', // Filter by category
    showButton = true,
    buttonText = 'View All Products',
    buttonLink = '/shopping',
    columns = 3
  } = content;

  const { backgroundColor = '', padding = 'large' } = settings;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let endpoint = `/items/public?limit=${displayCount}&is_active=true`;
        if (categorySlug) {
          endpoint += `&category=${categorySlug}`;
        }
        
        const response = await api.get(endpoint);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [displayCount, categorySlug]);

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined
  };

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <section className={`block block-products padding-${padding}`} style={sectionStyle}>
        <div className="container">
          {title && <h2 className="block-title text-center">{title}</h2>}
          <div className="products-loading">Loading products...</div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't render if no products
  }

  return (
    <section className={`block block-products padding-${padding}`} style={sectionStyle}>
      <div className="container">
        {(title || subtitle) && (
          <div className="block-header text-center">
            {title && <h2 className="block-title">{title}</h2>}
            {subtitle && <p className="block-subtitle">{subtitle}</p>}
          </div>
        )}
        
        <div className="products-grid" style={gridStyle}>
          {products.map(product => (
            <Link 
              key={product.id} 
              to={`/product/${product.id}`}
              className="product-card"
            >
              <div className="product-image">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} loading="lazy" />
                ) : (
                  <div className="product-image-placeholder">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                {product.description && (
                  <p className="product-description">
                    {product.description.length > 80 
                      ? `${product.description.slice(0, 80)}...` 
                      : product.description
                    }
                  </p>
                )}
                <div className="product-price">
                  {formatPrice(product.price)}
                  {product.unit && <span className="product-unit"> / {product.unit}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {showButton && (
          <div className="products-cta text-center">
            <Link to={buttonLink} className="btn btn-primary">
              {buttonText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGridBlock;
