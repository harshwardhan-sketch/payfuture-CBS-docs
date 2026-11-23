/* The two API references, as on the live API docs: Gateway API (#/gateway/...) and Auth API (#/auth/...).
   This file holds their menus, page titles, notes and Overview pages.
   Every endpoint page is built from the live specs (api-spec/*.js) by engine/api-pages.js.
   Endpoints are named "METHOD /path" exactly as in the spec. */

/* Menu groups, in order: [label, spec, tag in the spec, endpoints (optional: exactly these, in this order)].
   An endpoint not placed in any group still appears, under "Other". */
const API_GROUPS = [
  ['Authentication', 'auth', 'Authentication', ['POST /oauth/gettoken', 'POST /oauth/token', 'POST /oauth/token/refresh', 'DELETE /oauth/token', 'GET /users/{userId}/impersonate']],
  ['API keys', 'auth', 'API Keys'],
  ['Accounts', 'gateway', 'Accounts', ['GET /accounts/balances', 'GET /accounts', 'GET /accounts/{accountId}', 'GET /accounts/by-number/{accountNumber}']],
  ['Payouts', 'gateway', 'Transactions', ['POST /transfers/outbound-cbs', 'POST /transfers/outbound-cbs/pkr', 'POST /transfers/outbound', 'POST /transfers/internal', 'GET /exchange-rate/v2/{source}/{destination}']],
  ['Transactions', 'gateway', 'Transactions', ['GET /transactions/ref/{reference}', 'GET /transactions/{transactionId}', 'GET /transactions']],
  ['Beneficiaries', 'gateway', 'Beneficiary', ['POST /beneficiaries', 'GET /beneficiaries', 'GET /beneficiaries/{beneficiaryId}', 'PUT /beneficiaries/{beneficiaryId}', 'DELETE /beneficiaries/{beneficiaryId}', 'PUT /beneficiaries/{beneficiaryId}/approve', 'PUT /beneficiaries/{beneficiaryId}/reject']],
  ['Beneficiary account verification', 'gateway', 'Beneficiary Account Verification', ['POST /beneficiary-account-verifications', 'GET /beneficiary-account-verifications/{verificationId}']],
  ['Reports', 'gateway', 'Reporting', ['POST /accounts/{accountId}/reports/requests', 'GET /reports/requests/{reportGenerationId}', 'GET /reports/requests/{reportGenerationId}/download', 'GET /reports/requests', 'GET /accounts/{accountId}/reports', 'GET /reports/transactions/pdf', 'GET /reports/transactions/csv', 'GET /reports/transactions/{transactionId}/receipt']],
  ['Current user', 'auth', 'Current User'],
  ['Users', 'auth', 'Users'],
  ['Account holders', 'auth', 'Account Holders'],
  ['Branding templates', 'auth', 'Account Holder Templates'],
  ['Permissions', 'auth', 'Permissions'],
  ['Invitations', 'auth', 'Invitations'],
  ['Password & verification', 'auth', 'Password & Verification'],
  ['Registration', 'auth', 'Registration'],
];

/* Page titles. Endpoints not listed here use the summary from the spec. */
const API_TITLES = {
  gateway: {
    'GET /accounts/balances': 'Get balances',
    'GET /accounts': 'List accounts',
    'GET /accounts/{accountId}': 'Get an account',
    'GET /accounts/by-number/{accountNumber}': 'Get an account by number',
    'POST /transfers/outbound-cbs': 'INR payout',
    'POST /transfers/outbound-cbs/pkr': 'PKR payout',
    'POST /transfers/outbound': 'Payout to a saved beneficiary',
    'POST /transfers/internal': 'Internal transfer',
    'GET /exchange-rate/v2/{source}/{destination}': 'Get exchange rate',
    'GET /transactions/ref/{reference}': 'Get a transaction by your reference',
    'GET /transactions/{transactionId}': 'Get a transaction',
    'GET /transactions': 'List transactions',
    'POST /beneficiaries': 'Create a beneficiary',
    'GET /beneficiaries': 'List beneficiaries',
    'GET /beneficiaries/{beneficiaryId}': 'Get a beneficiary',
    'PUT /beneficiaries/{beneficiaryId}': 'Update a beneficiary',
    'DELETE /beneficiaries/{beneficiaryId}': 'Delete a beneficiary',
    'PUT /beneficiaries/{beneficiaryId}/approve': 'Approve a beneficiary',
    'PUT /beneficiaries/{beneficiaryId}/reject': 'Reject a beneficiary',
    'POST /beneficiary-account-verifications': 'Verify a beneficiary account',
    'GET /beneficiary-account-verifications/{verificationId}': 'Get a verification',
    'POST /accounts/{accountId}/reports/requests': 'Request an account report',
    'GET /reports/requests/{reportGenerationId}': 'Get report status',
    'GET /reports/requests/{reportGenerationId}/download': 'Download a report',
    'GET /reports/requests': 'List your report requests',
    'GET /accounts/{accountId}/reports': 'Account report (PDF)',
    'GET /reports/transactions/pdf': 'Transactions report (PDF)',
    'GET /reports/transactions/csv': 'Transactions report (CSV)',
    'GET /reports/transactions/{transactionId}/receipt': 'Transaction receipt (PDF)',
  },
  auth: {
    'POST /oauth/gettoken': 'Get a token',
    'POST /oauth/token': 'Get a token with permissions',
    'POST /oauth/token/refresh': 'Refresh a token',
    'DELETE /oauth/token': 'Revoke a token',
  },
};

/* A short note shown at the top of a page (HTML). */
const API_NOTES = {
  gateway: {
    'POST /transfers/outbound-cbs': 'Pays an Indian bank account directly: no saved beneficiary needed. See <a href="#/guide/payouts">Sending a payout</a>.',
    'POST /transfers/outbound-cbs/pkr': 'Pays a Pakistani bank account (IBAN) or an Easypaisa or JazzCash wallet directly. The fields in <code>paymentDetails</code> depend on <code>paymentMethod</code>.',
    'POST /transfers/outbound': 'Create the beneficiary first. For EUR payouts, <a href="#/gateway/verify-a-beneficiary-account">verify the beneficiary account</a> and send its <code>id</code> as <code>beneficiaryAccountVerificationId</code>.',
    'GET /transactions/ref/{reference}': 'The simplest way to check a payout: look it up by the <code>reference</code> you sent.',
  },
  auth: {
    'POST /oauth/gettoken': '<b>Start here.</b> The token response for external clients. Every Gateway call needs the <code>access_token</code> from this response. See <a href="#/guide/tokens">Get an access token</a>.',
    'POST /oauth/token': 'Used by the front end: the token response includes the user\'s associations with their permission groups and permissions. <a href="#/auth/get-a-token">POST /oauth/gettoken</a> is the token response for external clients.',
  },
};

/* each API starts with its own Overview; engine/api-pages.js adds the endpoint groups after it */
NAV.gateway = [['Get started', [['start', 'Overview']]]];
NAV.auth = [['Get started', [['start', 'Overview']]]];

/* the top of each API overview, as on the live API reference: version, OpenAPI version, title, description and
   the OpenAPI document to download (api-spec/downloads/, saved unchanged from the live API by tools/import_spec.py) */
const DOWNLOAD_FILES = {gateway: 'core-banking-apis', auth: 'account-management-apis'};
/* the download card: also used on the home page */
const specCard = (spec, link) => {
  const info = window.SPECS[spec].info, f = DOWNLOAD_FILES[spec], name = spec === 'gateway' ? 'Gateway API' : 'Auth API';
  return `<div class="spec-card" id="download">
  <div class="spec-card-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 3v12m0 0l-5-5m5 5l5-5M4 19h16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="spec-card-t"><span class="spec-card-k">Download OpenAPI Document · ${name}</span><b>${esc(info.title)}</b><small>v${esc(info.version)} · OpenAPI ${esc(window.SPECS[spec].openapi)}</small></div>
  <div class="spec-card-b"><a class="btn btn-yellow" href="api-spec/downloads/${f}.json" download>JSON</a><a class="btn btn-yellow" href="api-spec/downloads/${f}.yaml" download>YAML</a>${link ? `<a class="btn btn-ghost" href="#/${spec}/start">Open the ${name} →</a>` : ''}</div>
</div>`;
};
const apiHead = (spec, name, base) => {
  const info = window.SPECS[spec].info, f = DOWNLOAD_FILES[spec];
  return `<p class="crumb-api">${name}</p>
<div class="spec-badges"><span class="spec-badge">v${esc(info.version)}</span><span class="spec-badge">OpenAPI ${esc(window.SPECS[spec].openapi)}</span></div>
<h1>${esc(info.title)}</h1>
<p class="lead">${esc(info.description || '')}</p>
${specCard(spec)}
<div class="ep2"><span class="method get">BASE</span><code>${base}</code><button type="button" class="ep2-copy" data-copy-text="${base}" aria-label="Copy base URL">Copy</button></div>`;
};

PAGES.gateway.start = () => `${apiHead('gateway', 'Gateway API', BASE_URLS.gateway)}
<p>Every call needs a token from the <a href="#/auth/start">Auth API</a>.</p>
<h2>Authenticate every call</h2>
${code(`Authorization: Bearer <access_token>
X-ACCOUNT-HOLDER-ID: <account holder ID, provided by Support>
Content-Type: application/json`, 'http')}
<p>Get the token with <a href="#/auth/get-a-token">Get a token</a>. See <a href="#/guide/authentication">Authentication</a>.</p>
<h2>Build in this order</h2>
<div class="seqs">
  <a class="seq" href="#/auth/get-a-token"><span class="seq-n">1</span><span><b>Get a token</b><small>Auth API</small></span></a>
  <a class="seq" href="#/gateway/get-balances"><span class="seq-n">2</span><span><b>Get balances</b><small>Your first Gateway call</small></span></a>
  <a class="seq" href="#/guide/payouts"><span class="seq-n">3</span><span><b>Send a payout</b><small>INR, PKR or a saved beneficiary</small></span></a>
  <a class="seq" href="#/gateway/get-a-transaction-by-your-reference"><span class="seq-n">4</span><span><b>Check the status</b><small>Its transactionStatus</small></span></a>
</div>
<h2>Endpoints</h2>
${API.index('gateway')}
`;

PAGES.auth.start = () => `${apiHead('auth', 'Auth API', BASE_URLS.auth)}
<h2>Get a token</h2>
<p>Send the API key (<code>encodedKey</code>) as HTTP Basic. The response has <code>access_token</code>, <code>expires_in</code> (seconds) and <code>userId</code>.</p>
${code(`curl -X POST '${TOKEN_URL}' \\
  -H 'Authorization: Basic <encodedKey>' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  --data 'grant_type=client_credentials'`, 'bash')}
<p>Then send <code>Authorization: Bearer &lt;access_token&gt;</code> on every Gateway call. Step by step: <a href="#/guide/authentication">Step 1: Auth API</a>.</p>
<h2>Endpoints</h2>
${API.index('auth')}`;
