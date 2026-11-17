const pages = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('[data-page]');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const articleArea = document.getElementById('articleArea');

function showPage(id) {
  pages.forEach(p => { p.classList.remove('active'); p.style.display = ''; });
  document.querySelectorAll('.sidebar-item').forEach(n => n.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (target) target.classList.add('active');
  searchResults.classList.remove('active');
  searchResults.innerHTML = '';
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.sidebar-item').forEach(n => {
    if (n.dataset.page === id) n.classList.add('active');
  });
  // Update breadcrumb
  const bc = document.getElementById('breadcrumb');
  if (bc) {
    const titles = {
      home: 'Home', workflow: 'Call Workflow', core: 'Core Rules',
      payments: 'Payments & Billing', reinstatement: 'Reinstatement',
      cancellations: 'Cancellations', claims: 'Claims / FNOL',
      audit: 'Audit', certificates: 'Certificates & Docs',
      general: 'General Service', spiels: 'All Spiels',
      avoid: 'Phrases to Avoid', status: 'Status Matrix', docs: 'Documentation'
    };
    bc.innerHTML = `<a href="#" onclick="showPage('home');return false;">Home</a> » ${titles[id] || id}`;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.remove('open');
}

document.querySelectorAll('[data-page]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    showPage(item.dataset.page);
  });
});

// Build search index
const searchIndex = [];
document.querySelectorAll('.page').forEach(page => {
  const pageId = page.id.replace('page-', '');
  const title = page.querySelector('.article-title')?.textContent || pageId;
  page.querySelectorAll('.spiel, .infobox, td, li, .fact-box, p').forEach(el => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    if (text.length > 25) {
      searchIndex.push({
        pageId, title, text,
        snippet: text.substring(0, 160) + (text.length > 160 ? '…' : '')
      });
    }
  });
});

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 2) {
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      document.querySelectorAll('.page').forEach(p => {
        if (p.classList.contains('active')) p.style.display = '';
      });
      return;
    }
    pages.forEach(p => p.style.display = 'none');
    searchResults.classList.add('active');
    const hits = searchIndex.filter(item => item.text.toLowerCase().includes(q));
    const seen = new Set();
    const unique = [];
    hits.forEach(h => {
      const key = h.pageId + '|' + h.snippet.substring(0, 60);
      if (!seen.has(key)) { seen.add(key); unique.push(h); }
    });
    if (unique.length === 0) {
      searchResults.innerHTML = '<div class="no-results">No matching results. Try “reinstatement”, “statement of no loss”, “FNOL”, etc.</div>';
      return;
    }
    searchResults.innerHTML = `<p style="margin-bottom:12px;color:#54595d;">${unique.length} result(s) for “${searchInput.value}”</p>` +
      unique.slice(0, 40).map(h => {
        const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'gi');
        const highlighted = h.snippet.replace(re, '<span class="highlight">$1</span>');
        return `<div class="search-hit" onclick="showPage('${h.pageId}')">
          <div class="hit-driver">${h.title}</div>
          <div class="hit-snippet">${highlighted}</div>
        </div>`;
      }).join('');
  });
}

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    searchInput.focus();
  }
});

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
