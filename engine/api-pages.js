/* API reference pages, built from the live API specs (api-spec/gateway.js, api-spec/auth.js).
   Layout: parameters on the left, code examples on the right (same as the Payfuture payouts docs).
   The menu groups, titles and notes come from content/api-overview.js; example bodies from content/examples.js. */
const API = (() => {
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const refName = r => r && r.split('/').pop();
  const md = s => esc(s || '').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n\s*-\s+/g, '<br>• ').replace(/\n\n/g, '<br><br>');
  const dot = s => s && !/[.:)]$/.test(s.trim()) ? s.trim() + '.' : (s || '');

  /* ---------- endpoints ---------- */
  const OPS = [];
  for (const [specName, S] of Object.entries(window.SPECS)) {
    for (const [path, ops] of Object.entries(S.paths)) for (const [m, op] of Object.entries(ops)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(m)) continue;
      const key = `${m.toUpperCase()} ${path}`;
      const title = (API_TITLES[specName] || {})[key] || op.summary || key;
      OPS.push({spec: specName, S, method: m.toUpperCase(), path, op, key, tag: (op.tags || ['Other'])[0], title,
        note: (API_NOTES[specName] || {})[key], base: BASE_URLS[specName]});
    }
  }
  /* page ids: the title as a slug; made unique if two titles match */
  const used = {};
  OPS.forEach(o => { let id = slug(o.title); if (used[id]) id = slug(o.spec + ' ' + o.title); used[id] = 1; o.id = id; });
  const byKey = (spec, key) => OPS.find(o => o.spec === spec && o.key === key);

  const schemas = S => (S.components && S.components.schemas) || {};
  const resolve = (S, s) => (s && s.$ref) ? schemas(S)[refName(s.$ref)] : s;

  /* ---------- parameter list ---------- */
  function typeOf(S, p) {
    if (p.$ref) return 'object';
    if (p.type === 'array') return 'array of ' + (p.items && p.items.$ref ? 'objects' : ((p.items && p.items.type) || 'string') + 's');
    return (p.type || 'object') + (p.format && !/^int(32|64)$/.test(p.format) ? ` · ${p.format}` : '');
  }
  function enumText(e, name) {
    if (!e || !e.length) return '';
    if (e.length > 60) return ` <span class="prm-cond">${/currency/i.test(name) ? 'ISO 4217 currency code' : 'ISO 3166 two-letter country code'}</span>`;
    return ` <span class="prm-cond">One of: ${e.map(v => `<code>${esc(v)}</code>`).join(' ')}</span>`;
  }
  const exText = v => v === undefined || v === null || typeof v === 'object' || v === 0 || v === '' ? '' : `<div class="prm-ex"><b>Example:</b> <code>${esc(v)}</code></div>`;
  function prm(name, type, req, desc, ex, kids) {
    return `<div class="prm"><div class="prm-h"><code class="prm-n">${esc(name)}</code>${req ? '<span class="prm-star" title="Required">*</span>' : ''}<span class="prm-t">${esc(type)}</span>${req ? '<span class="prm-req yes">Required</span>' : '<span class="prm-req no">Optional</span>'}</div>
      <div class="prm-d">${desc}</div>${ex || ''}${kids ? `<details class="prm-kids"><summary>Child parameters</summary>${kids}</details>` : ''}</div>`;
  }
  /* schemas whose fields depend on another field (the spec cannot say so itself) */
  function propList(S, schema, depth = 0) {
    schema = resolve(S, schema);
    if (!schema || depth > 5) return '';
    if (schema.allOf) return schema.allOf.map(x => propList(S, x, depth)).join('');
    const req = schema.required || [];
    return Object.entries(schema.properties || {}).map(([name, p]) => {
      const vname = p.$ref && refName(p.$ref);
      const inner = p.$ref ? resolve(S, p) : (p.type === 'array' && p.items && p.items.$ref ? resolve(S, p.items) : null);
      let kids = '';
      if (VARIANTS[vname]) kids = VARIANTS[vname].map(([when, sch]) => `<p class="prm-sub">${esc(when)}</p>${propList(S, schemas(S)[sch], depth + 1)}`).join('');
      else if (inner && inner.properties) kids = propList(S, inner, depth + 1);
      const desc = md(dot(p.description || (inner && inner.description) || '')) + enumText(p.enum || (p.items && p.items.enum), name);
      return prm(name, typeOf(S, p), req.includes(name), desc, p.enum ? '' : exText(p.example), kids);
    }).join('');
  }
  const PAGEABLE = [['page', 'integer', 'Page number, starting at 0.'], ['size', 'integer', 'Items per page.'],
    ['sort', 'string', 'Field and direction, for example <code>createdDateTime,desc</code>. Repeat it to sort by more than one field.']];
  function params(o) {
    const out = {header: [], path: [], query: []};
    (o.op.parameters || []).forEach(p => {
      if (p.$ref) p = o.S.components.parameters[refName(p.$ref)];
      const sch = p.schema || {}, r = refName(sch.$ref);
      if (p.in === 'query' && r === 'Pageable') return PAGEABLE.forEach(([n, t, d]) => out.query.push(prm(n, t, false, d)));
      if (p.in === 'query' && r) {   /* a filter object: each field is its own query parameter */
        const s = schemas(o.S)[r];
        return Object.entries(s.properties || {}).forEach(([n, q]) => out.query.push(prm(n, typeOf(o.S, q), (s.required || []).includes(n), md(dot(q.description)) + enumText(q.enum || (q.items && q.items.enum), n), q.enum ? '' : exText(q.example))));
      }
      const desc = p.name === 'X-ACCOUNT-HOLDER-ID' ? 'Value of this is provided by Support. Typically received in the token response as <code>userId</code>. See <a href="#/guide/gateway">Step 2: Gateway API</a>.' : md(dot(p.description || sch.description || ''));
      (out[p.in] || out.query).push(prm(p.name, typeOf(o.S, sch), !!p.required || p.in === 'path', desc + enumText(sch.enum || (sch.items && sch.items.enum), p.name), sch.enum ? '' : exText(p.example ?? sch.example)));
    });
    return out;
  }

  /* ---------- example values ---------- */
  function sample(S, schema, name = '', depth = 0) {
    schema = resolve(S, schema);
    if (!schema || depth > 5) return null;
    if (schema.allOf) return Object.assign({}, ...schema.allOf.map(x => sample(S, x, name, depth)));
    if (schema.example !== undefined) return schema.example === 0 && /amount|value|balance/i.test(name) ? 1500 : schema.example;
    if (schema.enum) return schema.enum.includes('GB') ? 'GB' : schema.enum.includes('EUR') ? 'EUR' : schema.enum[0];
    if (schema.type === 'array') return [sample(S, schema.items, name, depth + 1)];
    if (schema.properties) {
      const o = {}; Object.entries(schema.properties).forEach(([k, p]) => { if (p.format !== 'binary') o[k] = sample(S, p, k, depth + 1); }); return o;
    }
    if (schema.format === 'uuid') return '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    if (schema.format === 'date-time') return '2026-11-23T10:15:30Z';
    if (schema.format === 'date') return '2026-11-01';
    if (schema.format === 'email') return 'jane.doe@example.com';
    if (schema.type === 'number' || schema.type === 'integer') return /amount|value|balance/i.test(name) ? 1500 : 0;
    if (schema.type === 'boolean') return false;
    return name ? `<${name}>` : 'string';
  }

  /* ---------- code panels ---------- */
  const lines = txt => hl(txt, 'json').split('\n').map(l => `<span class="ln">${l || ' '}</span>`).join('');
  let LANG = (() => { try { return localStorage.getItem('pf-lang') || 'cURL'; } catch (_) { return 'cURL'; } })();
  function panel(title, panes, kind) {
    const on = Math.max(0, panes.findIndex(([t]) => t === LANG));
    return `<div class="snip" data-snip="${kind}">
      <div class="snip-bar"><b>${title}</b>${panes.length > 1 ? `<div class="snip-tabs" role="tablist" aria-label="${title} format">${panes.map(([t], i) => `<button type="button" role="tab" class="${i === on ? 'on' : ''}" aria-selected="${i === on}" data-snip-tab="${i}">${t}</button>`).join('')}</div>` : `<span class="snip-one">${panes[0][0]}</span>`}<button type="button" class="snip-copy" data-snip-copy aria-label="Copy ${title.toLowerCase()}">Copy</button></div>
      ${panes.map(([, txt], i) => `<pre class="snip-pane${i === on ? ' on' : ''}" data-snip-pane="${i}"><code>${lines(txt)}</code></pre>`).join('')}
    </div>`;
  }
  function headersOf(o) {
    const h = [];
    const basic = (o.op.parameters || []).some(p => p.name === 'Authorization');
    const open = /Unauthenticated/i.test(o.op.description || '');
    if (basic) h.push(['Authorization', 'Basic <apiKey>']);
    else if (!open) h.push(['Authorization', 'Bearer <token>']);
    if ((o.op.parameters || []).some(p => p.$ref && /ACCOUNT-HOLDER/i.test(p.$ref))) h.push(['X-ACCOUNT-HOLDER-ID', '<accountHolderId>']);
    return h;
  }
  function request(o, body) {
    const ct = Object.keys((o.op.requestBody || {}).content || {})[0];
    const url = o.base + o.path.replace(/\{(\w+)\}/g, (_, n) => (PATH_EXAMPLES[n] || `{${n}}`));
    const h = headersOf(o);
    if (ct && ct !== 'multipart/form-data') h.push(['Content-Type', ct]);
    return {ct, url, h, body};
  }
  const pyVal = s => s.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None');
  function snippets(o, body) {
    const r = request(o, body), m = o.method;
    const isForm = r.ct === 'application/x-www-form-urlencoded', isMulti = r.ct === 'multipart/form-data';
    const js = body !== undefined ? JSON.stringify(body, null, 2) : '';
    const form = isForm && body ? new URLSearchParams(body).toString() : '';
    const curl = [`curl -X ${m} '${r.url}'`, ...r.h.map(([k, v]) => `  -H '${k}: ${v}'`),
      ...(isForm && form ? [`  --data '${form}'`] : isMulti ? Object.entries(body || {}).map(([k, v]) => `  -F '${k}=${typeof v === 'object' ? JSON.stringify(v) : v}'`) : js ? [`  --data '${js.replace(/'/g, "'\\''")}'`] : [])].join(' \\\n');
    const hObj = h => `{ ${h.map(([k, v]) => `'${k}': '${v}'`).join(', ')} }`;
    const node = `const res = await fetch('${r.url}', {
  method: '${m}',
  headers: ${hObj(r.h)},${isForm && form ? `\n  body: new URLSearchParams(${JSON.stringify(body)}),` : js && !isMulti ? `\n  body: JSON.stringify(${js.replace(/\n/g, '\n  ')}),` : ''}
});
const data = await res.json();`;
    const py = `import requests

res = requests.${m.toLowerCase()}(
    "${r.url}",
    headers={${r.h.filter(([k]) => k !== 'Content-Type' || isForm).map(([k, v]) => `"${k}": "${v}"`).join(', ')}},${isForm && form ? `\n    data=${pyVal(JSON.stringify(body))},` : js && !isMulti ? `\n    json=${pyVal(js).replace(/\n/g, '\n    ')},` : ''}
)
data = res.json()`;
    const php = `<?php
$ch = curl_init('${r.url}');
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => '${m}',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [${r.h.map(([k, v]) => `'${k}: ${v}'`).join(', ')}],${isForm && form ? `\n    CURLOPT_POSTFIELDS => '${form}',` : js && !isMulti ? `\n    CURLOPT_POSTFIELDS => json_encode(${js.replace(/\{/g, '[').replace(/\}/g, ']').replace(/":/g, '" =>').replace(/\n/g, '\n    ')}),` : ''}
]);
$data = json_decode(curl_exec($ch), true);`;
    return [['cURL', curl], ['Node.js', node], ['Python', py], ['PHP', php]];
  }

  /* ---------- responses ---------- */
  function okResponse(o) {
    const rs = o.op.responses || {};
    const code = Object.keys(rs).find(c => /^2/.test(c));
    const r = code && rs[code], content = (r && r.content) || {};
    const types = Object.keys(content);
    const file = types.includes('application/octet-stream');
    const t = types.find(x => x !== 'application/octet-stream');
    return {code, r, file, schema: t && content[t].schema};
  }
  function respFields(o) {
    const {schema, file} = okResponse(o);
    if (file) return '<p class="pnote">The file itself (PDF or CSV). With <code>async=true</code>: <code>202 Accepted</code> and a <code>reportGenerationId</code> to poll.</p>';
    const s = resolve(o.S, schema);
    if (!s || (!s.properties && !s.allOf)) return '<p class="prm-empty">No response body.</p>';
    const name = refName(schema.$ref) || '';
    if (/^Page/.test(name) && s.properties.content) return `<p class="pnote">One page of results. The items are in <code>content</code>; use <code>totalElements</code>, <code>totalPages</code>, <code>number</code> and <code>last</code> to page through.</p><p class="prm-sub">Each item in content</p><div class="prm-list">${propList(o.S, s.properties.content.items)}</div>`;
    return `<div class="prm-list">${propList(o.S, s)}</div>`;
  }
  function respExample(o) {
    const {schema, file} = okResponse(o);
    if (file) return '(binary file)';
    const s = resolve(o.S, schema);
    if (!s || (!s.properties && !s.allOf)) return 'HTTP 200 OK (no body)';
    const name = refName(schema.$ref) || '';
    const v = /^Page/.test(name) && s.properties.content ? {content: [sample(o.S, s.properties.content.items)], totalElements: 1, totalPages: 1, number: 0, size: 20, first: true, last: true, empty: false} : sample(o.S, s);
    return JSON.stringify(v, null, 2);
  }
  function codes(o) {
    const rs = o.op.responses || {};
    return Object.entries(rs).sort(([a], [b]) => a.localeCompare(b)).map(([c, r]) => [`<code>${esc(c)}</code>`, esc(r.description || '')]);
  }

  /* ---------- the page ---------- */
  function page(o) {
    const P = params(o);
    const ct = Object.keys((o.op.requestBody || {}).content || {})[0];
    const bodySchema = ct && o.op.requestBody.content[ct].schema;
    const exs = EXAMPLES[`${o.method} ${o.path}`] || (bodySchema ? [['Example', sample(o.S, bodySchema)]] : [['Example', undefined]]);
    const url = o.base + o.path;
    const toc = [['endpoint', 'Endpoint'], ['params', 'Parameters'], ['codes', 'Responses']];
    const hdrs = headersOf(o).map(([k, v]) => `<code>${esc(k)}: ${esc(v)}</code>`).join(' ');
    const reqBody = bodySchema ? `<p class="prm-sub">Body · <code>${esc(ct)}</code></p><div class="prm-list">${propList(o.S, bodySchema)}</div>` : '';
    const reqHtml = [P.path.length ? `<p class="prm-sub">Path</p><div class="prm-list">${P.path.join('')}</div>` : '',
      P.query.length ? `<p class="prm-sub">Query</p><div class="prm-list">${P.query.join('')}</div>` : '',
      P.header.length ? `<p class="prm-sub">Headers</p><div class="prm-list">${P.header.join('')}</div>` : '', reqBody].join('') || '<p class="prm-empty">No parameters.</p>';
    const exSel = exs.length > 1 ? `<select class="snip-ex" aria-label="Choose example">${exs.map(([t], i) => `<option value="${i}">${esc(t)}</option>`).join('')}</select>` : `<span>${esc(exs[0][0] === 'Example' ? o.title : exs[0][0])}</span>`;
    const hasErr = (o.op.responses || {})['400'];
    const err = JSON.stringify(ERROR_EXAMPLE, null, 2);
    return `<div class="api2" data-op="${o.id}">
      <div class="api2-left">
        <div class="api2-head">
          <h1>${esc(o.title)}</h1><p class="lead">${md(o.op.description || '')}</p>
          <nav class="toc" aria-label="On this page">${toc.map(([id, t]) => `<a href="#" data-jump="${id}">${t}</a>`).join('')}</nav>
          <div class="ep2" id="endpoint"><span class="method ${o.method.toLowerCase()}">${o.method}</span><code>${esc(url)}</code><button type="button" class="ep2-copy" data-copy-text="${esc(url)}" aria-label="Copy endpoint">Copy</button></div>
          ${hdrs ? `<div class="ep2-h"><span>Headers</span> ${hdrs}</div>` : ''}
          ${o.note ? callout(`<p>${o.note}</p>`) : ''}
        </div>
        <aside class="api2-code" aria-label="Code examples"><div class="api2-sticky">
          <div class="snip-head"><span class="snip-dots" aria-hidden="true"><i></i><i></i><i></i></span>${exSel}</div>
          ${exs.map(([, b], i) => `<div class="ex-pane" data-ex="${i}"${i ? ' hidden' : ''}>${panel('Request', snippets(o, b), 'req')}</div>`).join('')}
          ${panel('Response', [['Success', respExample(o)], ...(hasErr ? [['Error', err]] : [])], 'res')}
          <p class="snip-foot">Example with sample values. Use your own token, IDs and values.</p>
        </div></aside>
        <div class="api2-body">
          <section class="pcard" id="params">
            <div class="pcard-top"><h2>Parameters</h2><div class="ptabs" role="tablist"><button type="button" role="tab" class="on" aria-selected="true" data-ptab="req">Request</button><button type="button" role="tab" aria-selected="false" data-ptab="res">Response</button></div></div>
            <div class="ppane on" data-ppane="req"><p class="pnote">Fields marked <span class="prm-star">*</span> are required.</p>${reqHtml}</div>
            <div class="ppane" data-ppane="res">${respFields(o)}</div>
          </section>
          <section id="codes"><h2>Responses</h2>${table(['Status', 'Meaning'], codes(o))}<p class="muted">Errors have the same body: see <a href="#/guide/errors">Errors</a>.</p></section>
        </div>
      </div>
    </div>`;
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const tb = e.target.closest('[data-ptab]');
    if (tb) { const card = tb.closest('.pcard'); card.querySelectorAll('[data-ptab]').forEach(b => { b.classList.toggle('on', b === tb); b.setAttribute('aria-selected', b === tb); });
      card.querySelectorAll('[data-ppane]').forEach(p => p.classList.toggle('on', p.dataset.ppane === tb.dataset.ptab)); return; }
    const st = e.target.closest('[data-snip-tab]');
    if (st) {
      const i = st.dataset.snipTab, isReq = st.closest('[data-snip]').dataset.snip === 'req';
      /* the language choice applies to every request panel on the page and is remembered */
      const snips = isReq ? document.querySelectorAll('[data-snip="req"]') : [st.closest('[data-snip]')];
      snips.forEach(snip => {
        snip.querySelectorAll('[data-snip-tab]').forEach(b => { const on = b.dataset.snipTab === i; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
        snip.querySelectorAll('[data-snip-pane]').forEach(p => p.classList.toggle('on', p.dataset.snipPane === i));
      });
      if (isReq) { LANG = st.textContent; try { localStorage.setItem('pf-lang', LANG); } catch (_) { /* ignore */ } }
      return;
    }
    const cp = e.target.closest('[data-snip-copy]');
    if (cp) { const pane = cp.closest('[data-snip]').querySelector('.snip-pane.on code'); navigator.clipboard?.writeText(pane.innerText.replace(/ /g, ' ')).catch(() => {}); cp.textContent = 'Copied ✓'; setTimeout(() => cp.textContent = 'Copy', 1300); return; }
    const ct = e.target.closest('[data-copy-text]');
    if (ct) { navigator.clipboard?.writeText(ct.dataset.copyText).catch(() => {}); ct.textContent = 'Copied ✓'; setTimeout(() => ct.textContent = 'Copy', 1300); }
  });
  document.addEventListener('change', e => {
    const s = e.target.closest('.snip-ex'); if (!s) return;
    s.closest('.api2-sticky').querySelectorAll('[data-ex]').forEach(p => { p.hidden = p.dataset.ex !== s.value; });
  });

  /* ---------- menu ---------- */
  function nav() {
    const placed = new Set(), groups = [];
    API_GROUPS.forEach(([label, spec, tag, keys]) => {
      /* with a list of endpoints: exactly those, in that order; without: every endpoint of the tag not shown yet */
      const ops = keys ? keys.map(k => byKey(spec, k)).filter(o => o && !placed.has(o))
        : OPS.filter(o => o.spec === spec && o.tag === tag && !placed.has(o));
      ops.forEach(o => placed.add(o));
      if (ops.length) groups.push([label, spec, ops]);
    });
    const left = OPS.filter(o => !placed.has(o));
    ['auth', 'gateway'].forEach(spec => { const l = left.filter(o => o.spec === spec); if (l.length) groups.push(['Other', spec, l]); });
    return groups;
  }
  /* every endpoint of one API, by group: for its overview page */
  function index(spec) {
    return nav().filter(([, sp]) => sp === spec).map(([label, , ops]) => `<h3>${esc(label)}</h3><div class="ep-index">${ops.map(o =>
      `<a href="#/${spec}/${o.id}"><span class="method ${o.method.toLowerCase()}">${o.method}</span><code>${esc(o.path)}</code><b>${esc(o.title)}</b></a>`).join('')}</div>`).join('');
  }
  return {OPS, page, nav, panel, snippets, byKey, index};
})();

/* register every endpoint as a page and add the groups to the API menu */
/* register every endpoint as a page of its API (#/gateway/... or #/auth/...) and add the groups to that API's menu */
API.nav().forEach(([label, spec, ops]) => NAV[spec].push([label, ops.map(o => [o.id, o.title])]));
API.OPS.forEach(o => { PAGES[o.spec][o.id] = () => API.page(o); });
