import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Context Providers
import { SiteProvider } from './context/SiteContext';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Dynamic Page (CMS-driven)
import DynamicPage from './pages/DynamicPage';

// Functional Page Components (require specific React logic)
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Menu from './pages/Menu';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Legacy pages (can be replaced by DynamicPage when CMS content is ready)
import Home from './pages/Home';
import FoodTrailer from './pages/FoodTrailer';
import FAQ from './pages/FAQ';
import Gallery from './pages/Gallery';
import OurStory from './pages/OurStory';
import Contact from './pages/Contact';

import './App.css';

/**
 * App Configuration
 * Set USE_DYNAMIC_PAGES to true when ready to use CMS-driven pages
 */
const USE_DYNAMIC_PAGES = true; // Toggle this to switch between hardcoded and CMS pages

function App() {
  return (
    <SiteProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            {/* ============================================================
                FUNCTIONAL PAGES (always use React components)
                These pages have complex logic that can't be replaced by CMS
                ============================================================ */}
            <Route path="/shopping" element={<Shop />} />
            <Route path="/shopping/:category" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/:slug" element={<Menu />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/account/login" element={<Login />} />

            {/* ============================================================
                CMS-DRIVEN OR LEGACY PAGES
                Switch between hardcoded components and DynamicPage
                ============================================================ */}
            
            {USE_DYNAMIC_PAGES ? (
              <>
                {/* Dynamic CMS Pages - content from database */}
                <Route path="/" element={<DynamicPage slug="" />} />
                <Route path="/story" element={<DynamicPage slug="story" />} />
                <Route path="/about" element={<DynamicPage slug="about" />} />
                <Route path="/contact" element={<DynamicPage slug="contact" />} />
                <Route path="/frequently-asked-questions" element={<DynamicPage slug="frequently-asked-questions" />} />
                <Route path="/faq" element={<DynamicPage slug="faq" />} />
                <Route path="/gallery" element={<DynamicPage slug="gallery" />} />
                <Route path="/farm-to-fork-food-trailer" element={<DynamicPage slug="farm-to-fork-food-trailer" />} />
                <Route path="/food-trailer" element={<DynamicPage slug="food-trailer" />} />
                
                {/* Catch-all for any CMS page by slug */}
                <Route path="/:slug" element={<DynamicPage />} />
              </>
            ) : (
              <>
                {/* Legacy hardcoded pages */}
                <Route path="/" element={<Home />} />
                <Route path="/farm-to-fork-food-trailer" element={<FoodTrailer />} />
                <Route path="/frequently-asked-questions" element={<FAQ />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/story" element={<OurStory />} />
                <Route path="/contact" element={<Contact />} />
              </>
            )}

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </SiteProvider>
  );
}

export default App;
