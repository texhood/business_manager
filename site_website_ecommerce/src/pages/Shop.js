import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Shop.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Category-based placeholder images for demo
const CATEGORY_PLACEHOLDERS = {
  'eggs': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555899058498-2H89M31WI3WIPPCGY3AL/eggs+in+carton.jpg',
  'poultry': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg',
  'chicken': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/73db0cf1-b04f-443d-b391-666c7fed9cc6/3+copy.jpg',
  'beef': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg',
  'cattle': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/920bc2fc-bb1c-4069-99bc-335475e74cba/Yoda+at+sunset.jpg',
  'lamb': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555899652498-RSGNQ1WYR8V2DKFQXFZW/sheep.jpg',
  'sheep': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1555899652498-RSGNQ1WYR8V2DKFQXFZW/sheep.jpg',
  'pork': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816675016-4KI49TCSYD4Y1AL9MZDU/IMG_1739.jpeg',
  'produce': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816670429-Q286VIVUPWNOQ9HQBEQK/20240323_113439.jpeg',
  'garden': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816670429-Q286VIVUPWNOQ9HQBEQK/20240323_113439.jpeg',
  'merch': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/7aa38ec7-bf17-43f2-90dd-867b4e81e2f9/Farm+to+Fork+Food+TREE+logo+green.png',
  'merchandise': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/7aa38ec7-bf17-43f2-90dd-867b4e81e2f9/Farm+to+Fork+Food+TREE+logo+green.png',
  'default': 'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1577170369127-IBXEQUXW5SK5ZLQULDAG/farm+mist+jpg.jpg'
};

const getProductImage = (product) => {
  if (product.image_url) return product.image_url;
  
  // Try to match category name to placeholder
  const categoryLower = (product.category_name || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (categoryLower.includes(key)) {
      return url;
    }
  }
  
  // Also check product name for hints
  const nameLower = (product.name || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (nameLower.includes(key)) {
      return url;
    }
  }
  
  return CATEGORY_PLACEHOLDERS.default;
};

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'All';
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          const categoryNames = data.data
            .filter(cat => cat.is_active)
            .map(cat => cat.name);
          setCategories(['All', ...categoryNames]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      
      try {
        let url = `${API_URL}/items?status=active`;
        if (currentCategory !== 'All') {
          url += `&category=${encodeURIComponent(currentCategory)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Unable to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, [currentCategory]);

  const handleCategoryChange = (category) => {
    if (category === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  // Helper to determine stock status display
  const getStockDisplay = (product) => {
    if (product.item_type !== 'inventory') {
      return null; // Digital/non-inventory items don't show stock
    }
    if (product.stock_status === 'out' || product.inventory_quantity === 0) {
      return { type: 'sold-out', text: 'Sold Out' };
    }
    if (product.stock_status === 'low' || (product.inventory_quantity && product.inventory_quantity <= 4)) {
      return { type: 'low-stock', text: `Only ${product.inventory_quantity} available` };
    }
    return null;
  };

  return (
    <div className="shop-page">
      <div className="shop-container">
        {/* Sidebar */}
        <aside className="shop-sidebar">
          <h3>Category</h3>
          <ul className="category-list">
            {categories.map(category => (
              <li key={category}>
                <button
                  className={`category-btn ${currentCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Products Grid */}
        <main className="shop-main">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>No products found in this category.</p>
              <button 
                className="btn btn-primary"
                onClick={() => handleCategoryChange('All')}
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => {
                const stockDisplay = getStockDisplay(product);
                const isOutOfStock = stockDisplay?.type === 'sold-out';
                
                return (
                  <div key={product.id} className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
                    <Link to={`/product/${product.id}`}>
                      <div className="product-image">
                        <img 
                          src={getProductImage(product)} 
                          alt={product.name} 
                        />
                        {stockDisplay && (
                          <span className={`badge badge-${stockDisplay.type}`}>
                            {stockDisplay.text}
                          </span>
                        )}
                        {product.is_featured && !stockDisplay && (
                          <span className="badge badge-featured">Featured</span>
                        )}
                      </div>
                      <div className="product-info">
                        <h4 className="product-name">{product.name}</h4>
                        <p className="product-price">
                          {product.member_price && product.member_price < product.price ? (
                            <>
                              <span className="member-price">${Number(product.member_price).toFixed(2)}</span>
                              <span className="regular-price">${Number(product.price).toFixed(2)}</span>
                            </>
                          ) : (
                            <>${Number(product.price).toFixed(2)}</>
                          )}
                        </p>
                      </div>
                    </Link>
                    <button 
                      className="quick-view-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Open quick view modal
                      }}
                    >
                      Quick View
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Shop;
