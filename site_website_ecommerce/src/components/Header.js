import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSite } from '../context/SiteContext';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { getCartCount, isCartOpen } = useCart();
  const site = useSite();

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

  // Build navigation items - combine CMS pages with functional pages
  const buildNavigation = () => {
    // Static functional pages that always appear
    const functionalPages = [
      { path: '/shopping', label: 'Shop', order: 10 },
      { path: '/cart', label: 'Cart', order: 98, hideInNav: true },
      { path: '/account/login', label: 'Login', order: 99 },
    ];

    // CMS-managed pages from site context
    const cmsPages = site.navigation.map(nav => ({
      path: nav.path,
      label: nav.label,
      type: nav.type,
      order: nav.type === 'home' ? 0 : 
             nav.type === 'about' ? 2 : 
             nav.type === 'contact' ? 20 : 
             nav.type === 'faq' ? 21 : 5
    }));

    // Combine and sort
    const allPages = [...cmsPages, ...functionalPages.filter(p => !p.hideInNav)];
    return allPages.sort((a, b) => a.order - b.order);
  };

  const navItems = buildNavigation();
  
  // Split into primary and secondary nav
  const primaryNav = navItems.slice(0, Math.ceil(navItems.length / 2));
  const secondaryNav = navItems.slice(Math.ceil(navItems.length / 2));

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          {site.logoUrl ? (
            <img src={site.logoUrl} alt={site.siteName} className="logo-image" />
          ) : (
            <span className="logo-text">{site.siteName || 'Hood Family Farms'}</span>
          )}
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
            {primaryNav.map((item, index) => (
              <li key={index}>
                <Link 
                  to={item.path} 
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="nav-list secondary-nav">
            {secondaryNav.map((item, index) => (
              <li key={index}>
                <Link 
                  to={item.path} 
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
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
      {site.tagline && (
        <div className="tagline-banner">
          <div className="container">
            <p>{site.tagline}</p>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
