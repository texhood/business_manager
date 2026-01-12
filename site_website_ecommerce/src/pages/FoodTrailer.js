import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FoodTrailer.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const galleryImages = [
  'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197280315-XR0BSJJC51JDAZ5LJ40Q/022824-HOOD+2.jpg',
  'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816671281-6HRSD5C7D5KKAQ6Y7TQF/20240323_112219.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816670429-Q286VIVUPWNOQ9HQBEQK/20240323_113439.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1711816675016-4KI49TCSYD4Y1AL9MZDU/IMG_1739.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197283561-G1ZM48P91C7RVL23M2ZX/022824-HOOD+6.jpg',
  'https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/1715197286322-TF0ZRM4RA3NBSIX6BLNA/022824-HOOD+12.jpg'
];

function FoodTrailer() {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(`${API_URL}/events/upcoming?limit=10`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setEventsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const handleViewItems = async () => {
    setShowItemsModal(true);
    if (menuItems.length === 0) {
      setItemsLoading(true);
      try {
        const response = await fetch(`${API_URL}/menus/items/public`);
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching menu items:', err);
      } finally {
        setItemsLoading(false);
      }
    }
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

  const formatEventDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getDateParts = (dateStr) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate()
    };
  };

  return (
    <div className="food-trailer-page">
      {/* Hero Section */}
      <section className="food-trailer-hero">
        <div className="container">
          <div className="hero-logo">
            <img 
              src="https://images.squarespace-cdn.com/content/v1/5cb69ab47a1fbd701676934b/7aa38ec7-bf17-43f2-90dd-867b4e81e2f9/Farm+to+Fork+Food+TREE+logo+green.png" 
              alt="Farm to Fork Food Logo"
            />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="food-trailer-gallery section">
        <div className="container">
          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <div key={index} className="gallery-item">
                <img src={image} alt={`Food trailer gallery ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="food-trailer-about section bg-light">
        <div className="container">
          <div className="about-content">
            <h2>Farm to Fork Food</h2>
            <p>
              This trailer is an extension of our Farm's mission to strengthen our local food 
              system and provide delicious and clean food to our community. Many of the images 
              above were taken by the uber talented Les Hassell for ETX View Magazine. They did 
              a beautiful write up on the farm to fork food trailer launch.
            </p>
            <a 
              href="https://www.etxview.com/food/bullard-couple-brings-farm-fresh-food-to-streets-of-east-texas/article_b8739dd6-d4f4-11ee-b723-675928041599.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Read the Full Article
            </a>
            <p className="social-cta">
              Be sure to follow us on{' '}
              <a href="https://www.facebook.com/hoodfamilyfarms/" target="_blank" rel="noopener noreferrer">Facebook</a>
              {' '}or{' '}
              <a href="https://www.instagram.com/hoodfamilyfarms/" target="_blank" rel="noopener noreferrer">Instagram</a>
              {' '}to keep up with our current menu offerings and set up locations. We rotate our menu 
              based on the seasons and local availability!
            </p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="food-trailer-actions section-sm">
        <div className="container">
          <div className="action-buttons">
            <Link to="/menu" className="btn btn-primary btn-lg">View Current Menu</Link>
            <button onClick={handleViewItems} className="btn btn-secondary btn-lg">
              Browse Items for Your Event
            </button>
            <Link to="/contact" className="btn btn-outline btn-lg">Event Inquiry</Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="food-trailer-events section">
        <div className="container">
          <h2>Upcoming Events</h2>
          
          {eventsLoading ? (
            <div className="events-loading">
              <div className="spinner"></div>
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="no-events">
              <p>No upcoming events scheduled. Check back soon!</p>
              <p>Follow us on social media for the latest updates.</p>
            </div>
          ) : (
            <div className="events-list">
              {events.map(event => {
                const dateParts = getDateParts(event.event_date);
                return (
                  <div key={event.id} className="event-card">
                    <div className="event-date-box">
                      <span className="month">{dateParts.month}</span>
                      <span className="day">{dateParts.day}</span>
                    </div>
                    <div className="event-details">
                      <h3>{event.title}</h3>
                      <p className="event-datetime">
                        <span className="date">{formatEventDate(event.event_date)}</span>
                        {event.start_time && (
                          <span className="time">
                            {formatTime(event.start_time)}
                            {event.end_time && ` - ${formatTime(event.end_time)}`}
                          </span>
                        )}
                      </p>
                      {event.location_name && (
                        <p className="event-location">
                          {event.location_name}
                          {event.map_url && (
                            <a href={event.map_url} target="_blank" rel="noopener noreferrer">(map)</a>
                          )}
                        </p>
                      )}
                      {event.description && (
                        <p className="event-description">{event.description}</p>
                      )}
                    </div>
                    <div className="event-actions">
                      {event.menu_slug ? (
                        <Link to={`/menu/${event.menu_slug}`} className="btn btn-sm btn-secondary">
                          View Menu →
                        </Link>
                      ) : (
                        <Link to="/menu" className="btn btn-sm btn-secondary">
                          View Menu →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Menu Items Modal for Event Planning */}
      {showItemsModal && (
        <div className="items-modal-overlay" onClick={() => setShowItemsModal(false)}>
          <div className="items-modal" onClick={e => e.stopPropagation()}>
            <div className="items-modal-header">
              <h2>Available Items for Your Event</h2>
              <button className="modal-close" onClick={() => setShowItemsModal(false)}>×</button>
            </div>
            <div className="items-modal-body">
              <p className="items-intro">
                Browse our available menu items below. Contact us to discuss your event and customize a menu that fits your needs.
              </p>
              
              {itemsLoading ? (
                <div className="items-loading">
                  <div className="spinner"></div>
                  <p>Loading items...</p>
                </div>
              ) : menuItems.length === 0 ? (
                <p>No items available at this time.</p>
              ) : (
                <div className="items-list">
                  {menuItems.map(item => (
                    <div key={item.id} className="item-card">
                      <h4>{item.name}</h4>
                      {item.description && <p className="item-description">{item.description}</p>}
                      {getDietaryIcons(item).length > 0 && (
                        <div className="dietary-icons">
                          {getDietaryIcons(item).map((icon, idx) => (
                            <span key={idx} className="dietary-icon" title={icon.title}>
                              {icon.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="items-cta">
                <p>Ready to plan your event?</p>
                <Link to="/contact" className="btn btn-primary" onClick={() => setShowItemsModal(false)}>
                  Contact Us for Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodTrailer;
