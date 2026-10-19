
(function(){
  // ---------- product data and price ka liya hai  ----------
  const products = [
    { id:'neem', name:'Kajorina Tapori Plant', price:899, desc:'Sculpted evergreen for gardens and entrances.', icon:'leafA', image:'images/Kajorina Tapori Plant.jpeg' },
    { id:'ashoka', name:'Golden Bottal Brush - Tapori Plant', price:1199, desc:'Bright ornamental foliage for outdoor spaces.', icon:'leafB', image: 'images/Golden Bottal Brush - Tapori Plant.jpeg' },
    { id:'curry', name:'Red Machira Plant', price:749, desc:'Dense green foliage for garden landscaping.', icon:'leafC', image:'images/Red Machira Plant.jpeg' },
    { id:'hibiscus', name:'Latusa Tapori Plant', price:649, desc:'A leafy nursery tree for outdoor planting.', icon:'flowerA', image:'images/Latusa Tapori Plant.jpeg' },

  ];

  const icons = {
    leafA: `<svg viewBox="0 0 100 100"><path d="M50 90c0-40 -25-55-25-55s5 45 25 55Z" fill="#4C7A3A"/><path d="M50 90c0-46 30-62 30-62s-2 48-30 62Z" fill="#6C9A56"/></svg>`,
    leafB: `<svg viewBox="0 0 100 100"><rect x="44" y="55" width="12" height="35" fill="#B5651D"/><circle cx="50" cy="42" r="30" fill="#4C7A3A"/><circle cx="34" cy="55" r="18" fill="#356028"/><circle cx="66" cy="55" r="18" fill="#6C9A56"/></svg>`,
    leafC: `<svg viewBox="0 0 100 100"><rect x="46" y="50" width="8" height="40" fill="#6B4226"/><path d="M50 55c-18-4-28-20-28-20s16 2 28 20Z" fill="#4C7A3A"/><path d="M50 55c18-4 28-20 28-20s-16 2-28 20Z" fill="#6C9A56"/><path d="M50 40c-14-4-22-18-22-18s14 1 22 18Z" fill="#356028"/><path d="M50 40c14-4 22-18 22-18s-14 1-22 18Z" fill="#4C7A3A"/></svg>`,
    flowerA: `<svg viewBox="0 0 100 100"><rect x="46" y="55" width="8" height="35" fill="#356028"/><circle cx="50" cy="45" r="10" fill="#F2A729"/><circle cx="35" cy="50" r="10" fill="#D98E04"/><circle cx="65" cy="50" r="10" fill="#D98E04"/><circle cx="42" cy="60" r="10" fill="#B5651D"/><circle cx="58" cy="60" r="10" fill="#B5651D"/></svg>`
  };

  // ---------- render shop grid ----------
  const grid = document.getElementById('plantGrid');
  grid.innerHTML = products.map(p => `
    <div class="plant-card">
      <div class="plant-figure">${p.image ? `<img class="plant-photo" src="${p.image}" alt="${p.name}" loading="lazy">` : icons[p.icon]}</div>
      <h3 class="plant-name">${p.name}</h3>
      <p class="plant-desc">${p.desc}</p>
      <div class="plant-foot">
        <span class="tag">₹${p.price}</span>
        <button class="add-btn" data-id="${p.id}">Add to cart</button>
      </div>
    </div>
  `).join('');

  // ---------- cart state (in-memory) ----------
  let cart = {}; // id -> qty

  function fmt(n){ return '₹' + n.toLocaleString('en-IN'); }

  function cartLines(){
    return Object.entries(cart).map(([id,qty]) => {
      const p = products.find(x=>x.id===id);
      return { p, qty, subtotal: p.price*qty };
    });
  }

  function cartTotal(){
    return cartLines().reduce((sum,l)=>sum+l.subtotal,0);
  }

  function renderCart(){
    const lines = cartLines();
    const count = lines.reduce((s,l)=>s+l.qty,0);
    document.getElementById('cartCount').textContent = count;

    const itemsEl = document.getElementById('drawerItems');
    if(lines.length===0){
      itemsEl.innerHTML = '<p class="drawer-empty">No plants added yet.</p>';
    } else {
      itemsEl.innerHTML = lines.map(l => `
        <div class="drawer-item">
          <div style="flex:1;">
            <div class="di-name">${l.p.name} ${l.qty>1 ? '× '+l.qty : ''}</div>
            <div class="di-price">${fmt(l.subtotal)}</div>
          </div>
          <button data-remove="${l.p.id}">Remove</button>
        </div>
      `).join('');
    }
    document.getElementById('drawerTotal').textContent = fmt(cartTotal());

    // update add-btn labels
    document.querySelectorAll('.add-btn').forEach(btn=>{
      const id = btn.getAttribute('data-id');
      if(cart[id]){
        btn.textContent = `Added (${cart[id]}) ✓`;
        btn.classList.add('added');
      } else {
        btn.textContent = 'Add to cart';
        btn.classList.remove('added');
      }
    });

    // update contact form summary + hidden field
    const summaryEl = document.getElementById('formCartSummary');
    const hiddenEl = document.getElementById('fCartHidden');
    if(lines.length===0){
      summaryEl.innerHTML = 'Your cart is empty — browse the vatika above and add a plant or two.';
      hiddenEl.value = '';
    } else {
      const text = lines.map(l=>`${l.p.name} ×${l.qty} (${fmt(l.subtotal)})`).join(', ');
      summaryEl.innerHTML = `<strong>Cart:</strong> ${text} — <strong>Total ${fmt(cartTotal())}</strong>`;
      hiddenEl.value = text + ' | Total ' + fmt(cartTotal());
    }
  }

  grid.addEventListener('click', e=>{
    const btn = e.target.closest('.add-btn');
    if(!btn) return;
    const id = btn.getAttribute('data-id');
    cart[id] = (cart[id]||0)+1;
    renderCart();
  });

  document.getElementById('drawerItems').addEventListener('click', e=>{
    const btn = e.target.closest('[data-remove]');
    if(!btn) return;
    const id = btn.getAttribute('data-remove');
    delete cart[id];
    renderCart();
  });

  // ---------- drawer open/close ----------
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('overlay');
  function openDrawer(){ drawer.classList.add('open'); overlay.classList.add('open'); }
  function closeDrawer(){ drawer.classList.remove('open'); overlay.classList.remove('open'); }
  document.getElementById('cartOpenBtn').addEventListener('click', openDrawer);
  document.getElementById('drawerCloseBtn').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.getElementById('drawerCheckout').addEventListener('click', closeDrawer);

  renderCart();

  // ---------- popup advertisement ----------
  const adOverlay = document.getElementById('adOverlay');
  function showAd(){ adOverlay.classList.add('show'); }
  function hideAd(){ adOverlay.classList.remove('show'); }
  setTimeout(showAd, 1600);
  document.getElementById('adCloseBtn').addEventListener('click', hideAd);
  document.getElementById('adDismissBtn').addEventListener('click', hideAd);
  document.getElementById('adShopBtn').addEventListener('click', ()=>{
    hideAd();
    document.getElementById('shop').scrollIntoView({behavior:'smooth'});
  });
  adOverlay.addEventListener('click', e=>{ if(e.target===adOverlay) hideAd(); });
})();

