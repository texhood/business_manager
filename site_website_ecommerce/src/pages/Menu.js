import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Menu.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

function Menu() {
  const { slug } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        // If slug provided, fetch specific menu; otherwise fetch featured
        const endpoint = slug 
          ? `${API_URL}/menus/${slug}`
          : `${API_URL}/menus/featured`;
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Menu not found');
          }
          throw new Error('Failed to fetch menu');
        }
        const data = await response.json();
        setMenu(data.data);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [slug]);

  const formatPrice = (price) => {
    if (!price) return null;
    return `$${Number(price).toFixed(2)}`;
  };

  const getDietaryIcons = (item) => {
    const icons = [];
    if (item.is_vegetarian) icons.push({ label: 'V', title: 'Vegetarian' });
    if (item.is_vegan) icons.push({ label: 'VG', title: 'Vegan' });
    if (item.is_gluten_free) icons.push({ label: 'GF', title: 'Gluten Free' });
    if (item.is_dairy_free) icons.push({ label: 'DF', title: 'Dairy Free' });
    if (item.is_spicy) icons.push({ label: '🌶️', title: 'Spicy' });
    return icons;
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="menu-page">
        <div className="container">
          <div className="error-state">
            <h2>Menu Not Available</h2>
            <p>{error || 'No menu is currently available.'}</p>
            <Link to="/farm-to-fork-food-trailer" className="btn btn-primary">
              ← Back to Food Trailer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      {/* Hero Section */}
      <section className="menu-hero">
        {menu.header_image ? (
          <div className="menu-hero-image">
            <img src={menu.header_image} alt={menu.name} />
          </div>
        ) : (
          <div className="menu-hero-default">
            <img 
              src="https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/7aa38ec7-bf17-43f2-90dd-867b4e81e2f9/Farm+to+Fork+Food+TREE+logo+green.png" 
              alt="Farm to Fork Food Logo"
              className="menu-logo"
            />
          </div>
        )}
        <div className="menu-hero-content">
          <h1>{menu.name}</h1>
          {menu.description && <p className="menu-description">{menu.description}</p>}
          {menu.season && menu.season !== 'all' && (
            <span className="menu-season">{menu.season} Menu</span>
          )}
        </div>
      </section>

      {/* Dietary Legend */}
      <section className="dietary-legend section-sm">
        <div className="container">
          <div className="legend-items">
            <span className="legend-item"><span className="icon">V</span> Vegetarian</span>
            <span className="legend-item"><span className="icon">VG</span> Vegan</span>
            <span className="legend-item"><span className="icon">GF</span> Gluten Free</span>
            <span className="legend-item"><span className="icon">DF</span> Dairy Free</span>
            <span className="legend-item"><span className="icon">🌶️</span> Spicy</span>
          </div>
        </div>
      </section>

      {/* Menu Sections */}
      <section className="menu-content section">
        <div className="container container-narrow">
          {menu.sections && menu.sections.length > 0 ? (
            menu.sections.map((section) => (
              <div key={section.id} className="menu-section">
                <div className="section-header">
                  <h2>{section.name}</h2>
                  {section.description && <p>{section.description}</p>}
                </div>
                
                <div className={`menu-items columns-${section.columns || 1}`}>
                  {section.items && section.items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`menu-item ${!item.is_available ? 'unavailable' : ''} ${item.is_featured ? 'featured' : ''}`}
                    >
                      {item.image_url && (
                        <div className="item-image">
                          <img src={item.image_url} alt={item.name} />
                        </div>
                      )}
                      <div className="item-content">
                        <div className="item-header">
                          <h3 className="item-name">
                            {item.name}
                            {item.is_featured && <span className="featured-badge">★</span>}
                          </h3>
                          {section.show_prices !== false && (
                            <span className="item-price">
                              {item.price_label || formatPrice(item.price)}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="item-description">{item.description}</p>
                        )}
                        <div className="item-meta">
                          {getDietaryIcons(item).length > 0 && (
                            <div className="dietary-icons">
                              {getDietaryIcons(item).map((icon, idx) => (
                                <span key={idx} className="dietary-icon" title={icon.title}>
                                  {icon.label}
                                </span>
                              ))}
                            </div>
                          )}
                          {!item.is_available && (
                            <span className="unavailable-label">Currently Unavailable</span>
                          )}
                        </div>
                        {item.allergens && item.allergens.length > 0 && (
                          <p className="allergen-warning">
                            Contains: {item.allergens.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="no-items">
              <p>Menu items coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer Text */}
      {menu.footer_text && (
        <section className="menu-footer section-sm bg-light">
          <div className="container container-narrow">
            <p>{menu.footer_text}</p>
          </div>
        </section>
      )}

      {/* Back Link */}
      <section className="menu-nav section-sm">
        <div className="container">
          <Link to="/farm-to-fork-food-trailer" className="btn btn-secondary">
            ← Back to Food Trailer
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Menu;
