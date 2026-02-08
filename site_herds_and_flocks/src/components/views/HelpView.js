/**
 * HelpView Component
 * Full-page help documentation viewer with table of contents.
 * Fetches markdown from the backend help API and renders it as HTML.
 *
 * Props:
 *   appSlug — The app identifier sent to GET /api/v1/help/:appSlug
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './HelpView.css';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

/* =========================================================================
   Lightweight Markdown → HTML parser
   ========================================================================= */

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseInline(text) {
  let result = text;
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  result = result.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
  return result;
}

function parseMarkdown(md) {
  const lines = md.split('\n');
  const html = [];
  const toc = [];
  let i = 0;
  let inCodeBlock = false, codeBlockContent = [];
  let inTable = false, tableRows = [];
  let inBlockquote = false, blockquoteLines = [];
  let inList = false, listItems = [], listOrdered = false;

  const flushBlockquote = () => { if (!inBlockquote) return; html.push(`<blockquote>${blockquoteLines.map(l => parseInline(l)).join('<br/>')}</blockquote>`); blockquoteLines = []; inBlockquote = false; };
  const flushTable = () => {
    if (!inTable) return;
    let t = '<div class="help-table-wrapper"><table>';
    tableRows.forEach((row, idx) => {
      if (idx === 1 && /^[\s|:-]+$/.test(row)) return;
      const cells = row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      const tag = idx === 0 ? 'th' : 'td';
      if (idx === 0) t += '<thead>'; if (idx === 2) t += '<tbody>';
      t += '<tr>' + cells.map(c => `<${tag}>${parseInline(c)}</${tag}>`).join('') + '</tr>';
      if (idx === 0) t += '</thead>';
    });
    if (tableRows.length > 2) t += '</tbody>';
    t += '</table></div>'; html.push(t); tableRows = []; inTable = false;
  };
  const flushList = () => { if (!inList) return; const tag = listOrdered ? 'ol' : 'ul'; html.push(`<${tag}>${listItems.map(i => `<li>${parseInline(i)}</li>`).join('')}</${tag}>`); listItems = []; inList = false; };

  while (i < lines.length) {
    const line = lines[i];
    if (line.trimStart().startsWith('```')) {
      if (inCodeBlock) { html.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`); codeBlockContent = []; inCodeBlock = false; } else { flushBlockquote(); flushTable(); flushList(); inCodeBlock = true; } i++; continue;
    }
    if (inCodeBlock) { codeBlockContent.push(line); i++; continue; }
    if (line.trim() === '') { flushBlockquote(); flushTable(); flushList(); i++; continue; }
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) { flushBlockquote(); flushTable(); flushList(); html.push('<hr/>'); i++; continue; }
    const hm = line.match(/^(#{1,6})\s+(.+)/);
    if (hm) { flushBlockquote(); flushTable(); flushList(); const lv = hm[1].length, txt = hm[2].trim(), id = slugify(txt); if (lv <= 3) toc.push({ level: lv, text: txt, id }); html.push(`<h${lv} id="${id}">${parseInline(txt)}</h${lv}>`); i++; continue; }
    if (line.trim().startsWith('|') || (line.includes('|') && line.trim().match(/^\|.*\|$/))) { flushBlockquote(); flushList(); inTable = true; tableRows.push(line.trim()); i++; continue; } else if (inTable) { flushTable(); continue; }
    if (line.trimStart().startsWith('> ')) { flushTable(); flushList(); inBlockquote = true; blockquoteLines.push(line.replace(/^>\s?/, '')); i++; continue; } else if (inBlockquote) { flushBlockquote(); continue; }
    const ulm = line.match(/^(\s*)[-*]\s+(.+)/);
    if (ulm) { flushBlockquote(); flushTable(); if (!inList || listOrdered) { flushList(); inList = true; listOrdered = false; } listItems.push(ulm[2]); i++; continue; }
    const olm = line.match(/^(\s*)\d+\.\s+(.+)/);
    if (olm) { flushBlockquote(); flushTable(); if (!inList || !listOrdered) { flushList(); inList = true; listOrdered = true; } listItems.push(olm[2]); i++; continue; }
    if (inList) flushList();
    html.push(`<p>${parseInline(line)}</p>`); i++;
  }
  if (inCodeBlock) html.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
  flushBlockquote(); flushTable(); flushList();
  return { html: html.join('\n'), toc };
}

/* =========================================================================
   HelpView React Component
   ========================================================================= */

const HelpView = ({ appSlug }) => {
  const [markdown, setMarkdown] = useState('');
  const [title, setTitle] = useState('Help');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTocId, setActiveTocId] = useState('');
  const [tocOpen, setTocOpen] = useState(true);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchHelp = async () => {
      setLoading(true); setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/help/${appSlug}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to load help (${res.status})`);
        const json = await res.json();
        setMarkdown(json.data.content);
        if (json.data.title) setTitle(json.data.title + ' — Help');
      } catch (err) { console.error('Help fetch error:', err); setError(err.message); }
      finally { setLoading(false); }
    };
    fetchHelp();
  }, [appSlug]);

  const { html, toc } = markdown ? parseMarkdown(markdown) : { html: '', toc: [] };

  useEffect(() => {
    if (!contentRef.current || toc.length === 0) return;
    const observer = new IntersectionObserver((entries) => { for (const e of entries) { if (e.isIntersecting) { setActiveTocId(e.target.id); break; } } }, { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 });
    const headings = contentRef.current.querySelectorAll('h1, h2, h3');
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [html, toc]);

  const scrollToSection = useCallback((id) => { const el = document.getElementById(id); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveTocId(id); } }, []);

  if (loading) return (<div className="help-view"><div className="help-loading"><div className="help-spinner" /><p>Loading documentation...</p></div></div>);
  if (error) return (<div className="help-view"><div className="help-error"><h2>Unable to Load Help</h2><p>{error}</p><p>Please check your connection and try again.</p></div></div>);

  return (
    <div className="help-view">
      <div className="help-header">
        <h1>📖 {title}</h1>
        <button className="help-toc-toggle" onClick={() => setTocOpen((v) => !v)} title={tocOpen ? 'Hide table of contents' : 'Show table of contents'}>{tocOpen ? '◀ Hide TOC' : '▶ Show TOC'}</button>
      </div>
      <div className="help-layout">
        {tocOpen && toc.length > 0 && (
          <nav className="help-toc"><h3>Contents</h3><ul>{toc.map((item) => (<li key={item.id} className={`toc-level-${item.level} ${activeTocId === item.id ? 'active' : ''}`}><button onClick={() => scrollToSection(item.id)}>{item.text}</button></li>))}</ul></nav>
        )}
        <article className="help-content" ref={contentRef} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

export default HelpView;
