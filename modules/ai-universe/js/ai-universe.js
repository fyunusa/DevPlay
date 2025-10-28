// AI Universe core
const AIU_BOOKMARKS_KEY = 'aiu_bookmarks_v1';
let aiuState = {
  bookmarks: new Set(JSON.parse(localStorage.getItem(AIU_BOOKMARKS_KEY) || '[]')),
  data: {
    models: [], datasets: [], tools: [], news: [], learn: [], timeline: [], demos: []
  }
};

function aiuSaveBookmarks() {
  try { localStorage.setItem(AIU_BOOKMARKS_KEY, JSON.stringify(Array.from(aiuState.bookmarks))); } catch(_) {}
}

function aiuId(item) {
  return item.id || item.url || item.link || item.name || item.title;
}

function aiuBookmarkBtn(id, active) {
  return `<button class="aiu-bookmark${active ? ' active' : ''}" data-id="${id}" aria-label="Bookmark"><i class="fas fa-star"></i></button>`;
}

function aiuAttachBookmarks(scope=document) {
  scope.querySelectorAll('.aiu-bookmark').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (aiuState.bookmarks.has(id)) { aiuState.bookmarks.delete(id); btn.classList.remove('active'); }
      else { aiuState.bookmarks.add(id); btn.classList.add('active'); }
      aiuSaveBookmarks();
      aiuRenderBookmarks();
    });
  });
}

function aiuCard(item, badges=[]) {
  const id = aiuId(item);
  const active = aiuState.bookmarks.has(id);
  return `
    <div class="aiu-card" style="position:relative">
      ${aiuBookmarkBtn(id, active)}
      <h3>${item.name || item.title}</h3>
      ${item.description ? `<p>${item.description}</p>` : ''}
      ${badges.length ? `<div class="aiu-meta">${badges.map(b=>`<span class="aiu-badge">${b}</span>`).join('')}</div>` : ''}
      ${item.url ? `<a class="aiu-link" href="${item.url}" target="_blank" rel="noopener">Visit <i class="fas fa-external-link-alt"></i></a>` : ''}
    </div>
  `;
}

function aiuListItem(item) {
  const id = aiuId(item);
  const active = aiuState.bookmarks.has(id);
  return `
    <div class="aiu-item" style="position:relative">
      ${aiuBookmarkBtn(id, active)}
      <h3>${item.title}</h3>
      ${item.summary ? `<p>${item.summary}</p>` : ''}
      ${item.link ? `<a class="aiu-link" href="${item.link}" target="_blank" rel="noopener">Read</a>` : ''}
    </div>
  `;
}

function aiuRenderDashboard() {
  const spotlight = document.getElementById('aiu-spotlight');
  const trending = document.getElementById('aiu-trending');
  const latest = document.getElementById('aiu-latest-news');
  const learntry = document.getElementById('aiu-learn-try');
  if (spotlight) spotlight.innerHTML = aiuState.data.models.slice(0,1).map(m=>aiuCard(m, [m.task, m.license].filter(Boolean))).join('') || '<div class="aiu-item">No spotlight yet.</div>';
  if (trending) trending.innerHTML = aiuState.data.tools.slice(0,4).map(t=>aiuCard(t, [t.category])).join('');
  if (latest) latest.innerHTML = aiuState.data.news.slice(0,4).map(aiuListItem).join('');
  if (learntry) learntry.innerHTML = aiuState.data.learn.slice(0,4).map(a=>aiuCard(a, [a.level || 'Guide'])).join('');
  aiuAttachBookmarks(document);
}

function aiuRenderModels() {
  const el = document.getElementById('aiu-models');
  if (!el) return;
  el.innerHTML = aiuState.data.models.map(m=>aiuCard(m, [m.task, m.license, m.source].filter(Boolean))).join('');
  aiuAttachBookmarks(el);
}

function aiuRenderDatasets() {
  const el = document.getElementById('aiu-datasets');
  if (!el) return;
  el.innerHTML = aiuState.data.datasets.map(d=>aiuCard(d, [d.size, d.source].filter(Boolean))).join('');
  aiuAttachBookmarks(el);
}

function aiuRenderTools() {
  const el = document.getElementById('aiu-tools');
  if (!el) return;
  el.innerHTML = aiuState.data.tools.map(t=>aiuCard(t, [t.category])).join('');
  aiuAttachBookmarks(el);
}

function aiuRenderNews() {
  const el = document.getElementById('aiu-news');
  if (!el) return;
  el.innerHTML = aiuState.data.news.map(aiuListItem).join('');
  aiuAttachBookmarks(el);
}

function aiuRenderLearn() {
  const el = document.getElementById('aiu-learn');
  if (!el) return;
  el.innerHTML = aiuState.data.learn.map(a=>aiuCard(a, [a.level || 'Guide'])).join('');
  aiuAttachBookmarks(el);
}

function aiuRenderTimeline() {
  const el = document.getElementById('aiu-timeline');
  if (!el) return;
  el.innerHTML = aiuState.data.timeline.map(e=>`<div class="aiu-item"><h3>${e.year} — ${e.title}</h3><p>${e.description || ''}</p></div>`).join('');
}

function aiuRenderDemos() {
  const el = document.getElementById('aiu-demos');
  if (!el) return;
  el.innerHTML = aiuState.data.demos.map(d=>aiuCard(d, [d.type || 'Demo'])).join('');
}

function aiuRenderBookmarks() {
  const el = document.getElementById('aiu-bookmarks');
  if (!el) return;
  const all = [
    ...aiuState.data.models,
    ...aiuState.data.datasets,
    ...aiuState.data.tools,
    ...aiuState.data.news,
    ...aiuState.data.learn
  ];
  const items = all.filter(x => aiuState.bookmarks.has(aiuId(x)));
  el.innerHTML = items.length ? items.map(i => ('title' in i ? aiuListItem(i) : aiuCard(i))).join('') : '<div class="aiu-item">No bookmarks yet.</div>';
  aiuAttachBookmarks(el);
}

function aiuSearch(query) {
  query = query.trim().toLowerCase();
  const res = { models: [], datasets: [], tools: [], news: [], learn: [] };
  if (!query) return res;
  const scan = (text) => (text || '').toLowerCase().includes(query);
  aiuState.data.models.forEach(m => { if (scan(m.name) || scan(m.description) || scan(m.task) || scan(m.license)) res.models.push(m); });
  aiuState.data.datasets.forEach(d => { if (scan(d.name) || scan(d.description) || scan(d.source)) res.datasets.push(d); });
  aiuState.data.tools.forEach(t => { if (scan(t.name) || scan(t.description) || scan(t.category)) res.tools.push(t); });
  aiuState.data.news.forEach(n => { if (scan(n.title) || scan(n.summary)) res.news.push(n); });
  aiuState.data.learn.forEach(a => { if (scan(a.title) || scan(a.description) || scan(a.level)) res.learn.push(a); });
  return res;
}

async function aiuFetch(file) {
  try { const res = await fetch(file); if (!res.ok) throw new Error('Failed ' + file); return await res.json(); }
  catch(e) { console.error('AIU fetch error:', e); return []; }
}

async function aiuLoadAll() {
  const base = 'data';
  const [models, datasets, tools, news, learn, timeline, demos] = await Promise.all([
    aiuFetch(`${base}/models.json`),
    aiuFetch(`${base}/datasets.json`),
    aiuFetch(`${base}/tools.json`),
    aiuFetch(`${base}/news.json`),
    aiuFetch(`${base}/learn.json`),
    aiuFetch(`${base}/timeline.json`),
    aiuFetch(`${base}/demos.json`)
  ]);
  aiuState.data.models = models;
  aiuState.data.datasets = datasets;
  aiuState.data.tools = tools;
  aiuState.data.news = news;
  aiuState.data.learn = learn;
  aiuState.data.timeline = timeline;
  aiuState.data.demos = demos;
}

function aiuSwitchTab(tab) {
  document.querySelectorAll('.aiu-tab').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tab));
  document.querySelectorAll('.aiu-section').forEach(s => s.classList.toggle('active', s.getAttribute('data-content') === tab));
}

document.addEventListener('DOMContentLoaded', async () => {
  // Tabs
  document.querySelectorAll('.aiu-tab').forEach(btn => btn.addEventListener('click', () => aiuSwitchTab(btn.getAttribute('data-tab'))));

  // Animated tab indicator
  const indicator = document.getElementById('aiu-tab-indicator');
  function updateIndicator() {
    const active = document.querySelector('.aiu-tab.active');
    if (!active || !indicator) return;
    const rect = active.getBoundingClientRect();
    const parentRect = active.parentElement.getBoundingClientRect();
    indicator.style.width = rect.width + 'px';
    indicator.style.transform = `translateX(${rect.left - parentRect.left}px)`;
  }
  window.addEventListener('resize', updateIndicator);
  new ResizeObserver(updateIndicator).observe(document.querySelector('.aiu-nav'));

  const origSwitch = aiuSwitchTab;
  aiuSwitchTab = function(tab){ origSwitch(tab); updateIndicator(); };

  // Parallax: subtle hero follow
  const hero = document.querySelector('.aiu-hero');
  if (hero) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 4;
      hero.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
  }

  // Particles (very lightweight decorative dots)
  const particles = document.createElement('canvas');
  particles.id = 'aiu-particles';
  document.body.appendChild(particles);
  const ctx = particles.getContext('2d');
  let P = [];
  function resize() { particles.width = window.innerWidth; particles.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  for (let i=0;i<60;i++) { P.push({ x: Math.random()*particles.width, y: Math.random()*particles.height, r: Math.random()*1.8+0.4, vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2 }); }
  function tick(){
    ctx.clearRect(0,0,particles.width,particles.height);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    P.forEach(p => { p.x+=p.vx; p.y+=p.vy; if (p.x<0||p.x>particles.width) p.vx*=-1; if (p.y<0||p.y>particles.height) p.vy*=-1; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); });
    requestAnimationFrame(tick);
  }
  tick();

  // Confetti on bookmark
  function confettiBurst(x,y){
    const c = document.createElement('canvas');
    c.className = 'aiu-confetti';
    document.body.appendChild(c);
    c.width = window.innerWidth; c.height = window.innerHeight;
    const cx = c.getContext('2d');
    const parts = Array.from({length: 30}).map(()=>({
      x, y, vx: (Math.random()-0.5)*6, vy: (Math.random()-0.8)*6, g: 0.18+Math.random()*0.2, s: 2+Math.random()*3, color: `hsl(${Math.floor(Math.random()*360)},80%,60%)`, life: 60+Math.random()*40
    }));
    function step(){
      cx.clearRect(0,0,c.width,c.height);
      parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.life--; cx.fillStyle=p.color; cx.fillRect(p.x,p.y,p.s,p.s); });
      if (parts.some(p=>p.life>0)) requestAnimationFrame(step); else c.remove();
    }
    step();
  }
  // Hook into bookmark buttons
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.aiu-bookmark').forEach(btn => {
      if (btn.dataset._confettiHooked) return;
      btn.dataset._confettiHooked = '1';
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        confettiBurst(rect.left + rect.width/2, rect.top + rect.height/2);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Search
  const q = document.getElementById('aiu-search');
  const clear = document.getElementById('aiu-clear');
  const meta = document.getElementById('aiu-search-meta');
  q.addEventListener('input', () => {
    const query = q.value;
    if (!query) { meta.style.display = 'none'; aiuRenderDashboard(); return; }
    const r = aiuSearch(query);
    const count = r.models.length + r.datasets.length + r.tools.length + r.news.length + r.learn.length;
    meta.textContent = `${count} results across models, datasets, tools, news, learn`;
    meta.style.display = 'block';
    // Show compact results on dashboard
    document.getElementById('aiu-spotlight').innerHTML = r.models.slice(0,1).map(m=>aiuCard(m, [m.task])).join('');
    document.getElementById('aiu-trending').innerHTML = r.tools.slice(0,4).map(t=>aiuCard(t, [t.category])).join('');
    document.getElementById('aiu-latest-news').innerHTML = r.news.slice(0,4).map(aiuListItem).join('');
    document.getElementById('aiu-learn-try').innerHTML = r.learn.slice(0,4).map(a=>aiuCard(a, [a.level || 'Guide'])).join('');
    aiuAttachBookmarks(document);
  });
  clear.addEventListener('click', () => { q.value = ''; q.dispatchEvent(new Event('input')); });

  // Load data and render
  await aiuLoadAll();
  aiuRenderDashboard();
  aiuRenderModels();
  aiuRenderDatasets();
  aiuRenderTools();
  aiuRenderNews();
  aiuRenderLearn();
  aiuRenderTimeline();
  aiuRenderDemos();
  aiuRenderBookmarks();
  updateIndicator();
});

