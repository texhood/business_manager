/**
 * Squarespace Blog Import Script
 * 
 * Imports blog posts from the Hood Family Farms Squarespace site
 * 
 * Usage: node scripts/import-squarespace-blog.js
 * 
 * Options:
 *   --dry-run    Preview what would be imported without saving
 *   --limit=N    Only import first N posts
 */

require('dotenv').config();
const https = require('https');
const http = require('http');
const { JSDOM } = require('jsdom');
const db = require('../config/database');
const logger = require('../src/utils/logger');

// Configuration - UPDATE THIS URL
const SQUARESPACE_SITE = 'https://www.hoodfamilyfarms.com';
const BLOG_PATH = '/blog';

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1]) : null;

/**
 * Fetch a URL and return the HTML content
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = response.headers.location.startsWith('http') 
          ? response.headers.location 
          : `${SQUARESPACE_SITE}${response.headers.location}`;
        return fetchPage(redirectUrl).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

/**
 * Extract blog post URLs from the blog listing page
 */
async function getBlogPostUrls() {
  console.log(`\n📖 Fetching blog listing from ${SQUARESPACE_SITE}${BLOG_PATH}...\n`);
  
  const html = await fetchPage(`${SQUARESPACE_SITE}${BLOG_PATH}`);
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const postUrls = [];
  
  // Squarespace blog selectors (may need adjustment based on template)
  const selectors = [
    'article.blog-item a.blog-item-title',
    'article a[href*="/blog/"]',
    '.blog-item a.entry-title',
    '.BlogList-item a',
    'a.BlogList-item-title',
    '.summary-title a',
    '.summary-item a[href*="/blog/"]',
    'h1.entry-title a',
    '.post-title a'
  ];
  
  for (const selector of selectors) {
    const links = document.querySelectorAll(selector);
    links.forEach(link => {
      let href = link.getAttribute('href');
      if (href) {
        // Make absolute URL
        if (href.startsWith('/')) {
          href = `${SQUARESPACE_SITE}${href}`;
        }
        if (!postUrls.includes(href) && href.includes('/blog/')) {
          postUrls.push(href);
        }
      }
    });
  }
  
  // Also try to find links in the main content area
  const allLinks = document.querySelectorAll('a[href*="/blog/"]');
  allLinks.forEach(link => {
    let href = link.getAttribute('href');
    if (href && href.includes('/blog/') && !href.endsWith('/blog/') && !href.endsWith('/blog')) {
      if (href.startsWith('/')) {
        href = `${SQUARESPACE_SITE}${href}`;
      }
      if (!postUrls.includes(href)) {
        postUrls.push(href);
      }
    }
  });
  
  console.log(`   Found ${postUrls.length} blog post URLs\n`);
  return postUrls;
}

/**
 * Extract blog post data from a single post page
 */
async function extractPostData(url) {
  const html = await fetchPage(url);
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Extract slug from URL
  const urlParts = url.split('/');
  const slug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
  
  // Title - try multiple selectors
  let title = '';
  const titleSelectors = [
    'h1.entry-title',
    'h1.blog-item-title',
    'article h1',
    '.BlogItem-title',
    '.entry-title',
    'h1[data-content-field="title"]',
    'meta[property="og:title"]'
  ];
  
  for (const selector of titleSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      title = el.tagName === 'META' ? el.getAttribute('content') : el.textContent.trim();
      if (title) break;
    }
  }
  
  // Date
  let publishedAt = null;
  const dateSelectors = [
    'time[datetime]',
    '.dt-published',
    '.blog-item-date',
    '.entry-date',
    '.BlogItem-date',
    'meta[property="article:published_time"]'
  ];
  
  for (const selector of dateSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      const dateStr = el.getAttribute('datetime') || el.getAttribute('content') || el.textContent;
      if (dateStr) {
        try {
          publishedAt = new Date(dateStr);
          if (isNaN(publishedAt.getTime())) publishedAt = null;
          else break;
        } catch (e) {
          publishedAt = null;
        }
      }
    }
  }
  
  // Content
  let content = '';
  const contentSelectors = [
    '.blog-item-content',
    '.entry-content',
    '.BlogItem-content',
    'article .sqs-block-content',
    '.post-body',
    '[data-block-type="2"]' // Squarespace text block
  ];
  
  for (const selector of contentSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      content = el.innerHTML.trim();
      if (content) break;
    }
  }
  
  // If still no content, try to get all text blocks
  if (!content) {
    const blocks = document.querySelectorAll('.sqs-block-html .sqs-block-content');
    if (blocks.length > 0) {
      content = Array.from(blocks).map(b => b.innerHTML).join('\n\n');
    }
  }
  
  // Featured image
  let featuredImage = '';
  const imageSelectors = [
    'meta[property="og:image"]',
    '.blog-item-image img',
    '.BlogItem-image img',
    'article img',
    '.entry-content img'
  ];
  
  for (const selector of imageSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      featuredImage = el.getAttribute('content') || el.getAttribute('src') || el.getAttribute('data-src');
      if (featuredImage) break;
    }
  }
  
  // Excerpt - use meta description or first paragraph
  let excerpt = '';
  const metaDesc = document.querySelector('meta[property="og:description"]') || 
                   document.querySelector('meta[name="description"]');
  if (metaDesc) {
    excerpt = metaDesc.getAttribute('content');
  }
  if (!excerpt && content) {
    // Extract first paragraph text
    const tempDom = new JSDOM(`<div>${content}</div>`);
    const firstP = tempDom.window.document.querySelector('p');
    if (firstP) {
      excerpt = firstP.textContent.trim().substring(0, 300);
      if (excerpt.length === 300) excerpt += '...';
    }
  }
  
  // Author
  let authorName = 'Hood Family Farms';
  const authorSelectors = [
    '.blog-item-author',
    '.author-name',
    '.BlogItem-author',
    'meta[name="author"]'
  ];
  
  for (const selector of authorSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      authorName = el.getAttribute('content') || el.textContent.trim();
      if (authorName) break;
    }
  }
  
  // Tags/Categories
  const tags = [];
  const tagSelectors = [
    '.blog-item-category a',
    '.entry-tags a',
    '.BlogItem-tags a',
    'a[href*="/blog/tag/"]',
    'a[href*="/blog?tag="]'
  ];
  
  for (const selector of tagSelectors) {
    const els = document.querySelectorAll(selector);
    els.forEach(el => {
      const tag = el.textContent.trim();
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    });
  }
  
  return {
    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    title: title || 'Untitled Post',
    excerpt,
    content,
    featured_image: featuredImage,
    author_name: authorName,
    published_at: publishedAt,
    tags,
    source_url: url
  };
}

/**
 * Save a blog post to the database
 */
async function savePost(post) {
  // Check if post already exists
  const existing = await db.query('SELECT id FROM blog_posts WHERE slug = $1', [post.slug]);
  
  if (existing.rows.length > 0) {
    console.log(`   ⏭️  Skipping "${post.title}" - already exists`);
    return { skipped: true };
  }
  
  await db.query(`
    INSERT INTO blog_posts (
      slug, title, excerpt, content, featured_image, author_name,
      status, published_at, tags, meta_title, meta_description
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [
    post.slug,
    post.title,
    post.excerpt,
    post.content,
    post.featured_image,
    post.author_name,
    'published',
    post.published_at,
    post.tags,
    post.title,
    post.excerpt
  ]);
  
  return { created: true };
}

/**
 * Main import function
 */
async function main() {
  console.log('\n🚜 Squarespace Blog Import Script');
  console.log('==================================\n');
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be saved\n');
  }
  
  try {
    // Get all blog post URLs
    const postUrls = await getBlogPostUrls();
    
    if (postUrls.length === 0) {
      console.log('❌ No blog posts found. The site structure may be different.');
      console.log('   Try visiting the blog page manually to verify the URL.\n');
      return;
    }
    
    const urlsToProcess = LIMIT ? postUrls.slice(0, LIMIT) : postUrls;
    console.log(`📝 Processing ${urlsToProcess.length} posts...\n`);
    
    let created = 0;
    let skipped = 0;
    let failed = 0;
    
    for (let i = 0; i < urlsToProcess.length; i++) {
      const url = urlsToProcess[i];
      console.log(`[${i + 1}/${urlsToProcess.length}] ${url}`);
      
      try {
        const post = await extractPostData(url);
        
        if (DRY_RUN) {
          console.log(`   ✅ "${post.title}"`);
          console.log(`      Slug: ${post.slug}`);
          console.log(`      Date: ${post.published_at || 'unknown'}`);
          console.log(`      Excerpt: ${(post.excerpt || '').substring(0, 80)}...`);
          console.log(`      Content length: ${post.content.length} chars`);
          console.log(`      Tags: ${post.tags.join(', ') || 'none'}`);
          console.log(`      Image: ${post.featured_image ? 'yes' : 'no'}`);
          created++;
        } else {
          const result = await savePost(post);
          if (result.created) {
            console.log(`   ✅ Imported "${post.title}"`);
            created++;
          } else if (result.skipped) {
            skipped++;
          }
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        failed++;
      }
      
      // Small delay to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n==================================');
    console.log('📊 Import Summary:');
    console.log(`   ${DRY_RUN ? 'Would create' : 'Created'}: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log('==================================\n');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error.stack);
  } finally {
    await db.close();
  }
}

// Run the script
main();
