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
   Handles: headings, bold, italic, inline code, code blocks, tables,
   links, images, unordered/ordered lists, blockquotes, horizontal rules.
   ========================================================================= */

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseInline(text) {
  // Order matters: process code first so inner formatting is preserved
  let result = text;

  // Inline code (must come before bold/italic to avoid conflicts)
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Images ![alt](src)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');

  // Links [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Bold **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic *text* or _text_ (single)
  result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  result = result.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');

  return result;
}

function parseMarkdown(md) {
  const lines = md.split('\n');
  const html = [];
  const toc = [];
  let i = 0;
  let inCodeBlock = false;
  let codeBlockContent = [];
  let inTable = false;
  let tableRows = [];
  let inBlockquote = false;
  let blockquoteLines = [];
  let inList = false;
  let listItems = [];
  let listOrdered = false;

  const flushBlockquote = () => {
    if (!inBlockquote) return;
    const inner = blockquoteLines.map(l => parseInline(l)).join('<br/>');
    html.push(`<blockquote>${inner}</blockquote>`);
    blockquoteLines = [];
    inBlockquote = false;
  };

  const flushTable = () => {
    if (!inTable) return;
    // tableRows[0] = header, tableRows[1] = separator, rest = body
    let tableHtml = '<div class="help-table-wrapper"><table>';
    tableRows.forEach((row, idx) => {
      // Skip separator row
      if (idx === 1 && /^[\s|:-]+$/.test(row)) return;
      const cells = row.split('|').filter((c, ci, arr) => ci > 0 && ci < arr.length - 1 || arr.length === 2).map(c => c.trim());
      // If the split didn't get clean cells, try again without filtering
      const cleanCells = row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      const tag = idx === 0 ? 'th' : 'td';
      const wrap = idx === 0 ? 'thead' : (idx === 2 ? 'tbody' : '');
      if (idx === 0) tableHtml += '<thead>';
      if (idx === 2) tableHtml += '<tbody>';
      tableHtml += '<tr>';
      cleanCells.forEach(cell => {
        tableHtml += `<${tag}>${parseInline(cell)}</${tag}>`;
      });
      tableHtml += '</tr>';
      if (idx === 0) tableHtml += '</thead>';
    });
    // Close tbody if we had body rows
    if (tableRows.length > 2) tableHtml += '</tbody>';
    tableHtml += '</table></div>';
    html.push(tableHtml);
    tableRows = [];
    inTable = false;
  };

  const flushList = () => {
    if (!inList) return;
    const tag = listOrdered ? 'ol' : 'ul';
    const items = listItems.map(item => `<li>${parseInline(item)}</li>`).join('');
    html.push(`<${tag}>${items}</${tag}>`);
    listItems = [];
    inList = false;
  };

  while (i < lines.length) {
    const line = lines[i];

    // --- Code blocks ---
    if (line.trimStart().startsWith('```')) {
      if (inCodeBlock) {
        html.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
        codeBlockContent = [];
        inCodeBlock = false;
        i++;
        continue;
      } else {
        flushBlockquote();
        flushTable();
        flushList();
        inCodeBlock = true;
        i++;
        continue;
      }
    }
    if (inCodeBlock) {
      codeBlockContent.push(line);
      i++;
      continue;
    }

    // --- Blank line: flush open blocks ---
    if (line.trim() === '') {
      flushBlockquote();
      flushTable();
      flushList();
      i++;
      continue;
    }

    // --- Horizontal rule ---
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      flushBlockquote();
      flushTable();
      flushList();
      html.push('<hr/>');
      i++;
      continue;
    }

    // --- Headings ---
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      flushBlockquote();
      flushTable();
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = slugify(text);
      if (level <= 3) {
        toc.push({ level, text, id });
      }
      html.push(`<h${level} id="${id}">${parseInline(text)}</h${level}>`);
      i++;
      continue;
    }

    // --- Table row ---
    if (line.trim().startsWith('|') || (line.includes('|') && line.trim().match(/^\|.*\|$/))) {
      flushBlockquote();
      flushList();
      if (!inTable) inTable = true;
      tableRows.push(line.trim());
      i++;
      continue;
    } else if (inTable) {
      flushTable();
      // Don't increment i — reprocess this line
      continue;
    }

    // --- Blockquote ---
    if (line.trimStart().startsWith('> ')) {
      flushTable();
      flushList();
      inBlockquote = true;
      blockquoteLines.push(line.replace(/^>\s?/, ''));
      i++;
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
      continue;
    }

    // --- Unordered list ---
    const ulMatch = line.match(/^(\s*)[-*]\s+(.+)/);
    if (ulMatch) {
      flushBlockquote();
      flushTable();
      if (!inList || listOrdered) {
        flushList();
        inList = true;
        listOrdered = false;
      }
      listItems.push(ulMatch[2]);
      i++;
      continue;
    }

    // --- Ordered list ---
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)/);
    if (olMatch) {
      flushBlockquote();
      flushTable();
      if (!inList || !listOrdered) {
        flushList();
        inList = true;
        listOrdered = true;
      }
      listItems.push(olMatch[2]);
      i++;
      continue;
    }

    // --- Paragraph ---
    if (inList) {
      flushList();
    }
    html.push(`<p>${parseInline(line)}</p>`);
    i++;
  }

  // Flush any remaining open blocks
  if (inCodeBlock) {
    html.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
  }
  flushBlockquote();
  flushTable();
  flushList();

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

  // Fetch help content
  useEffect(() => {
    const fetchHelp = async () => {
      setLoading(true);
      setError(null);
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
      } catch (err) {
        console.error('Help fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHelp();
  }, [appSlug]);

  // Parse markdown
  const { html, toc } = markdown ? parseMarkdown(markdown) : { html: '', toc: [] };

  // Scroll-spy: track which heading is in view
  useEffect(() => {
    if (!contentRef.current || toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 }
    );

    const headings = contentRef.current.querySelectorAll('h1, h2, h3');
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [html, toc]);

  // Scroll to section
  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveTocId(id);
    }
  }, []);

  // --- Render ---

  if (loading) {
    return (
      <div className="help-view">
        <div className="help-loading">
          <div className="help-spinner" />
          <p>Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="help-view">
        <div className="help-error">
          <h2>Unable to Load Help</h2>
          <p>{error}</p>
          <p>Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="help-view">
      <div className="help-header">
        <h1>📖 {title}</h1>
        <button
          className="help-toc-toggle"
          onClick={() => setTocOpen((v) => !v)}
          title={tocOpen ? 'Hide table of contents' : 'Show table of contents'}
        >
          {tocOpen ? '◀ Hide TOC' : '▶ Show TOC'}
        </button>
      </div>

      <div className="help-layout">
        {/* Table of Contents */}
        {tocOpen && toc.length > 0 && (
          <nav className="help-toc">
            <h3>Contents</h3>
            <ul>
              {toc.map((item) => (
                <li
                  key={item.id}
                  className={`toc-level-${item.level} ${activeTocId === item.id ? 'active' : ''}`}
                >
                  <button onClick={() => scrollToSection(item.id)}>
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Content */}
        <article
          className="help-content"
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
};

export default HelpView;
