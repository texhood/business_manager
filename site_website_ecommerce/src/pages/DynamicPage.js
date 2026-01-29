/**
 * Dynamic Page Component
 * Fetches page content from database and renders blocks
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import siteContentApi from '../services/siteContent';
import BlockRenderer from '../components/blocks/BlockRenderer';
import './DynamicPage.css';

const DynamicPage = ({ slug: propSlug }) => {
  const { slug: paramSlug } = useParams();
  const site = useSite();
  
  // Use prop slug if provided, otherwise use route param, default to '' for home
  const slug = propSlug !== undefined ? propSlug : (paramSlug || '');
  
  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try Site Builder system first (page_blocks)
        const pageData = await siteContentApi.getPageWithBlocks(slug);
        
        if (pageData) {
          setPage(pageData);
          setBlocks(pageData.blocks || []);
          
          // Update document title
          const pageTitle = pageData.seo_title || pageData.title;
          document.title = pageTitle 
            ? `${pageTitle} | ${site.siteName}`
            : site.defaultSeoTitle || site.siteName;
          
          // Update meta description
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc && pageData.seo_description) {
            metaDesc.setAttribute('content', pageData.seo_description);
          }
        } else {
          // Fallback: try Site Designer system (page_sections)
          const designerPage = await siteContentApi.getPageBySlug(slug);
          
          if (designerPage) {
            setPage(designerPage);
            // Convert sections to blocks format for rendering
            const convertedBlocks = (designerPage.sections || []).map(section => ({
              id: section.id,
              block_type: section.section_type,
              content: section.settings || {},
              settings: {},
              display_order: section.sort_order
            }));
            setBlocks(convertedBlocks);
          } else {
            setError('Page not found');
          }
        }
      } catch (err) {
        console.error('Error loading page:', err);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug, site.siteName, site.defaultSeoTitle]);

  // Loading state
  if (loading) {
    return (
      <div className="dynamic-page dynamic-page--loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dynamic-page dynamic-page--error">
        <div className="error-message">
          <h1>Page Not Found</h1>
          <p>The page you're looking for doesn't exist or isn't published yet.</p>
        </div>
      </div>
    );
  }

  // No content state
  if (!page || blocks.length === 0) {
    return (
      <div className="dynamic-page dynamic-page--empty">
        <div className="empty-message">
          <h1>{page?.title || 'Untitled Page'}</h1>
          <p>This page has no content yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dynamic-page">
      <BlockRenderer blocks={blocks} />
    </div>
  );
};

export default DynamicPage;
