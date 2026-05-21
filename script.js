// --- MOCK DATA ---
const fakeTLDs = [
  { ext: '.com', price: 12.99 },
  { ext: '.net', price: 14.99 },
  { ext: '.org', price: 11.99 },
  { ext: '.io', price: 39.99 }
];

// --- APP STATE ---
const app = {
  domains: [
    { name: 'my-startup.com', price: 12.99, expiry: '2024-10-24' },
    { name: 'cool-app.net', price: 14.99, expiry: '2025-01-15' }
  ],
  cartCount: 0,
  
  // --- LOGIC: Check Availability (Mock) ---
  checkAvailability: function(domainQuery) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Logic: If name contains 'z', it's taken (fake logic)
        const isTaken = domainQuery.toLowerCase().includes('z');
        resolve({
          name: domainQuery,
          available: !isTaken,
          price: 12.99
        });
      }, 800); // Simulate network delay
    });
  },

  // --- ROUTER ---
  router: function(page) {
    const container = document.getElementById('main-content');
    container.innerHTML = ''; // Clear content

    if (page === 'home') {
      this.renderHome(container);
    } else if (page === 'dashboard') {
      this.renderDashboard(container);
    }
  },

  // --- VIEW: Home Page ---
  renderHome: function(container) {
    // 1. Hero Section
    const hero = document.createElement('div');
    hero.className = 'hero';
    hero.innerHTML = `
      <h1>Find your perfect domain name</h1>
      <p>Secure your identity online for as low as $12.99/year</p>
      <div class="search-box-container">
        <input type="text" id="search-input" class="search-input" placeholder="Type a domain name (e.g. mysite.com)..." />
        <button id="search-btn" class="search-btn" onclick="app.handleSearch()">Search</button>
      </div>
    `;
    container.appendChild(hero);

    // 2. Results Area
    const results = document.createElement('div');
    results.className = 'results-container';
    results.id = 'results-area';
    container.appendChild(results);

    // 3. Popular TLDs
    const popular = document.createElement('div');
    popular.className = 'extensions-section';
    popular.innerHTML = `
      <h2 class="section-title">Popular Extensions</h2>
      <div class="extensions-grid">
        ${fakeTLDs.map(tld => `
          <div class="ext-card">
            <div class="ext-name">${tld.ext}</div>
            <div class="ext-price">$${tld.price}/yr</div>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(popular);
  },

  // --- VIEW: Dashboard Page ---
  renderDashboard: function(container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dashboard-wrapper';

    // Generate Table Rows
    let rows = '';
    if (this.domains.length === 0) {
      rows = '<tr><td colspan="4" style="text-align:center; padding:20px;">No domains registered yet.</td></tr>';
    } else {
      rows = this.domains.map((d, index) => `
        <tr>
          <td>${d.name}</td>
          <td>$${d.price}</td>
          <td>${d.expiry}</td>
          <td><button class="delete-btn" onclick="app.removeDomain(${index})">Remove</button></td>
        </tr>
      `).join('');
    }

    wrapper.innerHTML = `
      <div class="dashboard-header">
        <h2>My Dashboard</h2>
        <button class="search-new-btn" onclick="app.router('home')">Search New Domain</button>
      </div>
      <table class="domain-table">
        <thead>
          <tr>
            <th>Domain Name</th>
            <th>Price</th>
            <th>Expiration Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
    container.appendChild(wrapper);
  },

  // --- HANDLER: Search ---
  handleSearch: async function() {
    const input = document.getElementById('search-input');
    const btn = document.getElementById('search-btn');
    const resultsArea = document.getElementById('results-area');
    const query = input.value.trim().toLowerCase();

    if (!query) return;

    // Loading
    btn.textContent = 'Searching...';
    btn.disabled = true;
    resultsArea.innerHTML = '';

    // API Call
    const result = await this.checkAvailability(query);

    // Render Result
    btn.textContent = 'Search';
    btn.disabled = false;

    const card = document.createElement('div');
    card.className = `domain-result-card ${result.available ? 'available' : 'taken'}`;
    
    if (result.available) {
      card.innerHTML = `
        <div class="domain-details available">
          <h3>✅ ${result.name} is available!</h3>
          <p>Great choice. Register it now.</p>
        </div>
        <div class="domain-action">
          <span class="price-tag">$${result.price}/yr</span>
          <button class="add-to-cart-btn" onclick="app.addToCart('${result.name}', ${result.price})">Add to Cart</button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="domain-details taken">
          <h3>❌ ${result.name} is taken</h3>
          <p>This domain