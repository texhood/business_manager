import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

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
  
  const categoryLower = (product.category_name || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (categoryLower.includes(key)) return url;
  }
  
  const nameLower = (product.name || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (nameLower.includes(key)) return url;
  }
  
  return CATEGORY_PLACEHOLDERS.default;
};

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch product on mount
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/items/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [id]);

  // Product options (if available - could be variants, sizes, etc.)
  // For now, we'll create options from the product itself
  const options = product?.options || null;
  const selectedOption = options ? options[selectedOptionIndex] : null;
  const currentPrice = selectedOption ? selectedOption.price : (product?.price || 0);

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Create a product object for the cart
    const productImage = getProductImage(product);
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: currentPrice,
      images: [productImage],
      image: productImage
    };
    
    addToCart(cartProduct, quantity, selectedOption);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Determine if product is in stock
  const isInStock = product ? (
    product.item_type !== 'inventory' || 
    (product.inventory_quantity && product.inventory_quantity > 0)
  ) : false;

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>Product Not Found</h2>
            <p>{error || 'This product could not be found.'}</p>
            <Link to="/shopping" className="btn btn-primary">
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Parse details from description or use defaults
  const details = product.description ? 
    product.description.split('\n').filter(line => line.trim()) :
    ['Quality product from Hood Family Farms'];

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shopping">Shop</Link>
          {product.category_name && (
            <>
              <span>/</span>
              <Link to={`/shopping?category=${product.category_slug || product.category_name}`}>
                {product.category_name}
              </Link>
            </>
          )}
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={getProductImage(product)} 
                alt={product.name} 
              />
              {!isInStock && (
                <div className="sold-out-overlay">
                  <span>Sold Out</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-detail">
            <h1>{product.name}</h1>
            
            {/* Price Display */}
            <div className="price-container">
              {product.member_price && Number(product.member_price) < Number(product.price) ? (
                <>
                  <p className="price member-price-display">
                    ${Number(product.member_price).toFixed(2)}
                    <span className="price-label">Farm Member Price</span>
                  </p>
                  <p className="regular-price-display">
                    Regular: ${Number(product.price).toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="price">${Number(currentPrice).toFixed(2)}</p>
              )}
            </div>

            {product.description && (
              <p className="description">{product.description}</p>
            )}

            {/* Product Options (if available) */}
            {options && options.length > 0 && (
              <div className="product-options">
                <label htmlFor="product-size">Size</label>
                <select 
                  id="product-size"
                  value={selectedOptionIndex}
                  onChange={(e) => setSelectedOptionIndex(parseInt(e.target.value))}
                >
                  {options.map((option, index) => (
                    <option key={index} value={index}>
                      {option.name} - ${option.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity */}
            <div className="quantity-selector">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button 
                  className="qty-btn" 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  min="1" 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button 
                  className="qty-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Status */}
            {product.item_type === 'inventory' && isInStock && product.inventory_quantity <= 5 && (
              <p className="low-stock-warning">
                Only {product.inventory_quantity} left in stock!
              </p>
            )}

            {/* Add to Cart */}
            <button 
              className={`btn btn-primary btn-lg add-to-cart ${!isInStock ? 'disabled' : ''} ${addedToCart ? 'added' : ''}`}
              disabled={!isInStock}
              onClick={handleAddToCart}
            >
              {!isInStock 
                ? 'Sold Out' 
                : addedToCart 
                  ? '✓ Added to Cart!' 
                  : 'Add to Cart'}
            </button>

            {/* Product Details */}
            {details.length > 0 && (
              <div className="product-details">
                <h3>Details</h3>
                <ul>
                  {details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Shipping Info */}
            <div className="shipping-info">
              <h3>Shipping</h3>
              <p>
                {product.shipping_zone === 'not-shippable' 
                  ? 'Local pickup only - not available for shipping'
                  : product.shipping_zone === 'in-state'
                    ? 'Available for shipping within Texas'
                    : product.shipping_zone === 'in-country'
                      ? 'Available for shipping within the United States'
                      : 'Ships worldwide'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
