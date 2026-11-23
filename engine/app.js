/* Payfuture Banking API developer docs: renderer and router.
   Sections: #/guide/... (Integration guide), #/gateway/... (Gateway API) and #/auth/... (Auth API), each with its own side menu.
   Guide pages live in content/guide.js; the API reference is built from the API specs (api-spec/*.js) by engine/api-pages.js.
   Build-free: open index.html directly. How to change anything: README.md. */

/* clickjacking: these docs only run in their own window or inside a page of this site */
(() => { let ok = window.top === window.self; try { ok = ok || window.top.location.origin === location.origin; } catch (_) { ok = false; }
  if (!ok) { document.documentElement.style.display = 'none'; try { window.top.location = location.href; } catch (_) { /* sandboxed */ } } })();
/* addresses can hold a malformed %-sequence: decode without ever throwing */
const dec = s => { try { return decodeURIComponent(s); } catch (_) { return String(s); } };

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
/* element text only: quotes stay as they are, so the JSON colouring below can find them */
const escText = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function hl(src, lang) {
  let h = escText(src);
  if (lang === 'json') {
    h = h.replace(/("(?:[^"\\]|\\.)*")(\s*:)?/g, (m, str, colon) => colon ? `<span class="k">${str}</span>${colon}` : `<span class="s">${str}</span>`)
         .replace(/\b(true|false|null|-?\d+(?:\.\d+)?)\b(?![^<]*>)/g, '<span class="n">$1</span>');
  }
  return h;
}
function code(src, lang = 'json') {
  return `<pre><span class="lang">${lang}</span><button class="copy">Copy</button><code style="all:unset">${hl(String(src).trim(), lang)}</code></pre>`;
}
function table(head, rows) {
  return `<table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${
    rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function fields(rows) {
  return table(['Field', 'Type', 'Required', 'Description'], rows.map(([f, t, r, d]) => [`<code>${f}</code>`, t,
    r === true ? '<span class="req">Required</span>' : r === false ? '<span class="opt">Optional</span>' : r, d]));
}
const ep = (m, p) => `<div class="endpoint"><span class="method ${m.toLowerCase()}">${m}</span><span>${p}</span></div>`;
const callout = (html, kind = '') => `<div class="callout ${kind}">${html}</div>`;
const steps = items => `<ol class="steps">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join('')}</ol>`;

/* ---------- sections ---------- */
const SECTIONS = {
  guide: {label: 'Integration guide', sub: PRODUCT_SHORT, tab: 'guide'},
  gateway: {label: 'Gateway API', sub: 'Accounts, payouts and reports', tab: 'gateway'},
  auth: {label: 'Auth API', sub: 'Tokens, API keys and users', tab: 'auth'},
};
const PAGES = {guide: {}, gateway: {}, auth: {}};
const NAV = {guide: [], gateway: [], auth: []};
/* full-width pages without a side menu: [title, page()] */
const SOLO = {};
/* per-page hooks for the interactive pages: INIT[pageId](arg) runs after the page is drawn */
const INIT = {};
/* pages that moved or were removed: old links keep working */
const MOVED = {};

/* phones hide the header tabs, so the slide-out menu repeats them at the top */
const mobileTabs = () => `<div class="mtabs">${[...document.querySelectorAll('#switch a')].map(a => `<a href="${a.getAttribute('href')}" data-tab="${a.dataset.tab}">${a.textContent}</a>`).join('')}<a href="https://www.payfuture.net/" target="_blank" rel="noopener">About Payfuture ↗</a></div>`;
const setTab = tab => document.querySelectorAll('#switch a, .mtabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));

/* ---------- router ---------- */
const app = document.getElementById('app');
/* sidebar groups the reader folded away (kept in this browser) */
const CLOSED = new Set((() => { try { return JSON.parse(localStorage.getItem('pf-nav-closed') || '[]'); } catch (_) { return []; } })());
function render() {
  const [, sec, id, arg] = (location.hash || '#/').split('/');
  document.body.classList.remove('menu');
  if (sec === 'about') { location.replace('#/'); return; }
  if (MOVED[sec + '/' + id]) { location.replace(MOVED[sec + '/' + id] + (arg ? '/' + arg : '')); return; }
  if (SOLO[sec]) {
    app.innerHTML = `<div class="layout solo" data-sec="${sec}"><nav class="side">${mobileTabs()}</nav><main>${SOLO[sec][1](id)}</main></div>`;
    setTab(sec); document.title = `${SOLO[sec][0]} · ${PRODUCT}`; window.scrollTo(0, 0); afterRender(sec);
    /* deep link to a section: open its folded parts, then scroll to it */
    const el = arg && document.getElementById(arg);
    if (el) { for (let p = el; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
      el.querySelectorAll('details').forEach(d => { d.open = true; }); requestAnimationFrame(() => el.scrollIntoView({block: 'start'})); }
    return;
  }
  if (!SECTIONS[sec]) {
    app.innerHTML = home(); setTab(null);
    document.title = `${PRODUCT} · Developer Docs`; window.scrollTo(0, 0); afterRender('home'); return;
  }
  const flat = NAV[sec].flatMap(([g, items]) => items.map(i => [...i, g]));
  const cur = flat.find(i => i[0] === id) || flat[0];
  const idx = flat.indexOf(cur), prev = flat[idx - 1], next = flat[idx + 1];
  const S = SECTIONS[sec];
  const pager = `<div class="pager">${prev ? `<a href="#/${sec}/${prev[0]}" class="pg-prev"><small>← Previous</small>${prev[1]}</a>` : '<span></span>'}${next ? `<a href="#/${sec}/${next[0]}" class="pg-next"><small>Next →</small>${next[1]}</a>` : ''}</div>
    <div class="page-help"><span>Need help? Reach out on your integration channel · <a href="#/guide/${sec === 'guide' ? 'support' : 'errors'}">${sec === 'guide' ? 'How to raise an issue' : 'Errors and how to fix them'}</a></span></div>`;
  const main = `<nav class="crumb" aria-label="Breadcrumb"><a href="#/${sec}/${NAV[sec][0][1][0][0]}">${S.label}</a><span>/</span>${cur[2]}<span>/</span><b>${cur[1]}</b></nav>${PAGES[sec][cur[0]](arg)}${pager}`;
  const layout = app.querySelector('.layout');
  if (layout && layout.dataset.sec === sec) {
    layout.querySelector('main').innerHTML = main;
    layout.querySelectorAll('nav.side .sg a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === `#/${sec}/${cur[0]}`));
    const g = layout.querySelector('nav.side .sg a.on')?.closest('.sg'); if (g && g.classList.contains('closed')) { g.classList.remove('closed'); g.querySelector('.sg-h').setAttribute('aria-expanded', 'true'); }
  } else {
    app.innerHTML = `<div class="layout" data-sec="${sec}">
      <nav class="side">${mobileTabs()}<div class="side-product">${S.label} <small>${S.sub}</small></div><input id="navFilter" type="search" placeholder="Filter this menu" aria-label="Filter the menu by page title">
        ${NAV[sec].map(([g, items]) => { const open = !CLOSED.has(sec + ':' + g) || items.some(([pid]) => pid === cur[0]);
          return `<div class="sg${open ? '' : ' closed'}" data-g="${sec}:${g}"><h4><button type="button" class="sg-h" aria-expanded="${open}">${g}<span class="sg-chev" aria-hidden="true"></span></button></h4>${items.map(([pid, t]) => `<a href="#/${sec}/${pid}" class="${pid === cur[0] ? 'on' : ''}">${t}</a>`).join('')}</div>`; }).join('')}
      </nav><main>${main}</main></div>`;
  }
  setTab(S.tab);
  document.title = `${cur[1]} · ${S.label} · ${PRODUCT}`;
  window.scrollTo(0, 0);
  afterRender(cur[0], arg);
}
window.addEventListener('hashchange', render);

/* ---------- after every render ---------- */
function afterRender(pageId, arg) {
  /* soft fade-in for the new page content */
  const m = document.querySelector('#app main') || app;
  m.classList.remove('enter'); void m.offsetWidth; m.classList.add('enter');
  /* wrap tables so they scroll sideways on small screens */
  document.querySelectorAll('#app table').forEach(t => { if (!t.parentElement.classList.contains('tw')) { const w = document.createElement('div'); w.className = 'tw'; t.replaceWith(w); w.appendChild(t); } });
  if (INIT[pageId]) INIT[pageId](arg ? dec(arg) : '');
  document.dispatchEvent(new CustomEvent('pf:rendered', {detail: {pageId, arg}}));
}

/* ---------- UI events ---------- */
document.addEventListener('click', e => {
  const c = e.target.closest('.copy');
  if (c) { navigator.clipboard?.writeText(c.parentElement.querySelector('code').innerText).catch(() => {}); c.textContent = 'Copied'; setTimeout(() => c.textContent = 'Copy', 1200); }
  const tb = e.target.closest('.tabs button');
  if (tb) {
    const id = tb.parentElement.dataset.tabs, i = tb.dataset.i;
    tb.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === tb));
    document.querySelectorAll(`[data-pane^="${id}-"]`).forEach(p => p.classList.toggle('on', p.dataset.pane === `${id}-${i}`));
  }
  /* sidebar group headings fold their links */
  const gh = e.target.closest('.sg-h');
  if (gh) {
    const g = gh.closest('.sg'), closed = g.classList.toggle('closed');
    gh.setAttribute('aria-expanded', !closed);
    closed ? CLOSED.add(g.dataset.g) : CLOSED.delete(g.dataset.g);
    try { localStorage.setItem('pf-nav-closed', JSON.stringify([...CLOSED])); } catch (_) { /* ignore */ }
    return;
  }
  /* in-page links (section shortcuts): scroll to the target, opening any folded parent first */
  const j = e.target.closest('[data-jump]');
  if (j) {
    e.preventDefault();
    const el = document.getElementById(j.dataset.jump);
    if (el) { for (let p = el.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
      el.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
      /* if smooth scrolling is unavailable or interrupted, land on the section anyway */
      setTimeout(() => { if (Math.abs(el.getBoundingClientRect().top - 84) > 40 && innerHeight + scrollY < document.documentElement.scrollHeight - 2) el.scrollIntoView({block: 'start'}); }, 800);
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
    return;
  }
  const ds = e.target.closest('[data-search]');
  if (ds) { e.preventDefault(); window.openSearch?.(ds.dataset.search); }
  const b = e.target.closest('.copy-mini');
  if (b) { navigator.clipboard?.writeText(document.getElementById(b.dataset.copy).textContent).catch(() => {}); b.textContent = 'Copied ✓'; b.classList.add('done'); setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('done'); }, 1200); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'navFilter') {
    const q = e.target.value.toLowerCase().trim(), side = e.target.closest('nav.side'); let any = 0;
    side.classList.toggle('filtering', !!q);
    side.querySelectorAll('h4').forEach(h => {
      let n = h.nextElementSibling, shown = 0;
      while (n && n.tagName === 'A') { const ok = n.textContent.toLowerCase().includes(q); n.style.display = ok ? '' : 'none'; shown += ok; n = n.nextElementSibling; }
      h.style.display = shown ? '' : 'none'; any += shown;
    });
    let none = side.querySelector('.nav-none');
    if (!none) { none = document.createElement('p'); none.className = 'nav-none'; side.appendChild(none); }
    none.innerHTML = any ? '' : `No page titles match. <a href="#" data-search="${esc(e.target.value)}">Search all the docs for “${esc(e.target.value)}” →</a>`;
  }
});
document.getElementById('menuBtn').onclick = () => document.body.classList.toggle('menu');
document.getElementById('themeBtn').onclick = () => {
  const r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  /* switch colours instantly: no element should animate its colours on a theme change */
  r.classList.add('theme-switching'); r.dataset.theme = dark ? 'light' : 'dark'; void r.offsetWidth;
  setTimeout(() => r.classList.remove('theme-switching'), 0);
  try { localStorage.setItem('pf-theme', r.dataset.theme); } catch (_) {}
};
try { const t = localStorage.getItem('pf-theme'); if (t) document.documentElement.dataset.theme = t; } catch (_) {}

/* ---------- tabs ---------- */
let tabSeq = 0;
function tabs(items) {
  const id = 't' + (++tabSeq);
  return `<div class="tabs" data-tabs="${id}">${items.map((t, i) => `<button class="${i ? '' : 'on'}" data-i="${i}">${t[0]}</button>`).join('')}</div>` +
    items.map((t, i) => `<div class="tabpane ${i ? '' : 'on'}" data-pane="${id}-${i}">${t[1]}</div>`).join('');
}
