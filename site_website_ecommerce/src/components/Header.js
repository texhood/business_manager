import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { getCartCount, isCartOpen } = useCart();

  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-text">Hood Family Farms</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation */}
        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-list primary-nav">
            <li>
              <Link to="/farm-to-fork-food-trailer" className={location.pathname === '/farm-to-fork-food-trailer' ? 'active' : ''}>
                Farm to Fork Food Trailer
              </Link>
            </li>
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/blog" className={location.pathname === '/blog' ? 'active' : ''}>
                Blog
              </Link>
            </li>
            <li>
              <Link to="/shopping" className={location.pathname.includes('/shopping') ? 'active' : ''}>
                Shop
              </Link>
            </li>
          </ul>

          <ul className="nav-list secondary-nav">
            <li>
              <Link to="/account/login" className={location.pathname === '/account/login' ? 'active' : ''}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/frequently-asked-questions" className={location.pathname === '/frequently-asked-questions' ? 'active' : ''}>
                FAQ
              </Link>
            </li>
          </ul>
        </nav>

        {/* Cart */}
        <Link to="/cart" className={`cart-link ${isCartOpen ? 'pulse' : ''}`}>
          <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {cartCount > 0 && (
            <span className="cart-count">{cartCount}</span>
          )}
        </Link>
      </div>

      {/* Tagline Banner */}
      <div className="tagline-banner">
        <div className="container">
          <p>bringing clean, fresh, sustainably raised food to our local community</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
