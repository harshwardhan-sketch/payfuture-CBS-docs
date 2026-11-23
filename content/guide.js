/* Home page and Integration guide (#/guide/...).
   The guide follows the order a merchant integrates in: Step 1 the Auth API (API key, token), then Step 2 the Gateway API.
   Each page is HTML inside a template string (`...`). Inside it, write a backtick as \` and ${ as \${.
   Links: #/guide/<page>, #/gateway/<endpoint page>, #/auth/<endpoint page> (endpoint page ids are the page title as a slug).
   Facts here come from the live API specs and Payfuture's internal records only. */

const GD = PAGES.guide;
const next = (href, label) => `<p class="next"><a class="btn btn-navy" href="${href}">${label} →</a></p>`;
const ramp = nodes => `<div class="ramp">${nodes.map(([t, s], i) => `${i ? '<span class="ramp-arrow" aria-hidden="true">→</span>' : ''}<div class="ramp-node${s === 'hub' ? ' hub' : ''}"><b>${t}</b>${s && s !== 'hub' ? `<span>${s}</span>` : ''}</div>`).join('')}</div>`;
const GW = BASE_URLS.gateway;

NAV.guide = [
  ['Getting started', [['welcome', 'Welcome'], ['how-it-works', 'How the integration works'], ['quickstart', 'Quickstart']]],
  ['Step 1 · Auth API', [['authentication', 'Overview'], ['api-keys', 'Get your API key'], ['tokens', 'Get an access token'], ['token-lifecycle', 'Keep the token valid'], ['two-factor', 'Two-factor authentication']]],
  ['Step 2 · Gateway API', [['gateway', 'Overview'], ['accounts', 'Accounts and balances'], ['payouts', 'Sending a payout'], ['statuses', 'Tracking a payout'], ['beneficiaries', 'Beneficiaries'], ['reports', 'Reports']]],
  ['Reference', [['requests', 'Making requests'], ['errors', 'Errors'], ['team', 'Users and permissions']]],
  ['Go live', [['checklist', 'Go-live checklist']]],
  ['Help', [['faq', 'FAQ'], ['support', 'Support'], ['glossary', 'Glossary']]],
];

/* ---------- home ---------- */
function home() {
  return `<section class="ent-hero">
  <div class="ent-hero-in">
    <div class="hero-txt">
      <span class="kicker">${PRODUCT} · Developer docs</span>
      <h1>Your accounts and payouts, <em>through one API.</em></h1>
      <p>Check balances, pay out to bank accounts and wallets, track every transaction and download statements. Integrate in two steps: authenticate with the Auth API, then work with the Gateway API.</p>
      <div class="hero-ctas"><a class="btn btn-yellow" href="#/guide/how-it-works">Start the guide</a><a class="btn btn-ghost" href="#/gateway/start">Gateway API</a><a class="btn btn-ghost" href="#/auth/start">Auth API</a></div>
      <ul class="hero-facts"><li>REST and JSON, with a bearer token</li><li>INR and PKR payouts, or pay saved beneficiaries</li><li>Statements and exports in PDF or CSV</li><li>OpenAPI documents to download: <a href="#/gateway/start">Gateway API</a> and <a href="#/auth/start">Auth API</a>, JSON or YAML</li></ul>
    </div>
    <div class="hero-flow" aria-label="How the integration works">
      <span class="hero-flow-t">How the integration works</span>
      <ol>
        <li><span class="hf-n">1</span><div><b>Auth API: get your API key</b><small>Once, when you set up</small></div></li>
        <li><span class="hf-n">2</span><div><b>Auth API: get a token</b><small>Your API key in, a token out</small></div></li>
        <li><span class="hf-n">3</span><div><b>Gateway API: do the work</b><small>Balances, payouts, reports</small></div></li>
        <li class="done"><span class="hf-n">✓</span><div><b>Track every payout</b><small>By its transactionStatus</small></div></li>
      </ol>
    </div>
  </div>
</section>
<div class="home-ent home-wide">
  <section class="home-row">
    <div class="home-col">
      <h2>Step 1 · Auth API</h2>
      <div class="path-list">
        <a class="tile" href="#/guide/api-keys"><span class="tag">Set up</span><b>Get your API key</b><span>The credential your server signs in with.</span></a>
        <a class="tile" href="#/guide/tokens"><span class="tag">Every session</span><b>Get an access token</b><span>Exchange the API key for a token.</span></a>
        <a class="tile" href="#/guide/token-lifecycle"><span class="tag">Keep running</span><b>Keep the token valid</b><span>Reuse it, renew it before it expires.</span></a>
      </div>
    </div>
    <div class="home-col">
      <h2>Step 2 · Gateway API</h2>
      <div class="path-list">
        <a class="tile" href="#/guide/accounts"><span class="tag">First call</span><b>Accounts and balances</b><span>What you hold, and the account you pay from.</span></a>
        <a class="tile" href="#/guide/payouts"><span class="tag">Pay out</span><b>Sending a payout</b><span>INR, PKR or a saved beneficiary.</span></a>
        <a class="tile" href="#/guide/statuses"><span class="tag">Follow up</span><b>Tracking a payout</b><span>Check its transactionStatus.</span></a>
      </div>
    </div>
  </section>
  <section class="home-specs">
    <h2>OpenAPI documents</h2>
    <p class="muted">Download each API's full OpenAPI document as JSON or YAML, or open its reference.</p>
    ${specCard('gateway', true)}
    ${specCard('auth', true)}
  </section>
</div>`;
}

/* ---------- getting started ---------- */
GD.welcome = () => `<h1>Welcome</h1>
<p class="lead">These APIs are available for registered clients: accounts, payouts, beneficiaries, transactions and reports.</p>
<h2>Two APIs, used in order</h2>
${table(['', 'API', 'What you use it for'], [
  ['<b>Step 1</b>', '<a href="#/auth/start">Auth API</a>', 'Sign in: turn your API key into an access token.'],
  ['<b>Step 2</b>', '<a href="#/gateway/start">Gateway API</a>', 'Everything else: accounts, payouts, beneficiaries, transactions and reports. Every call carries the token from step 1.'],
])}
<h2>What you need before you start</h2>
${steps([
  ['Your OAuth2 details', 'All APIs are authenticated using OAuth2; the details are provided by Support.'],
  ['Your account holder ID', 'Sent as the <code>X-ACCOUNT-HOLDER-ID</code> header on every Gateway call. Provided by Support; typically received in the token response as <code>userId</code>.'],
])}
${next('#/guide/how-it-works', 'How the integration works')}`;

GD['how-it-works'] = () => `<h1>How the integration works</h1>
<p class="lead">Your server authenticates once with the Auth API, then makes as many Gateway API calls as it needs with the token it got.</p>
${ramp([['Your server', 'holds the API key'], ['Auth API', 'POST /oauth/gettoken'], ['Access token', 'hub'], ['Gateway API', 'every call'], ['Result', 'balances, payouts, reports']])}
<h2>Step 1 · Auth API (sign in)</h2>
${steps([
  ['Get an API key, once', '<a href="#/auth/create-an-api-key">Create an API key</a>. You receive an <code>encodedKey</code>, returned only once: store it securely.'],
  ['Get an access token', 'Send the <code>encodedKey</code> to <a href="#/auth/get-a-token">POST /oauth/gettoken</a>. You get an <code>access_token</code> and how long it lasts (<code>expires_in</code>, in seconds).'],
  ['Refresh the token', 'Before it expires, get a new one with <a href="#/auth/refresh-a-token">POST /oauth/token/refresh</a>. See <a href="#/guide/token-lifecycle">Keep the token valid</a>.'],
])}
<h2>Step 2 · Gateway API (do the work)</h2>
${steps([
  ['Send two headers on every call', '<code>Authorization: Bearer &lt;access_token&gt;</code> and <code>X-ACCOUNT-HOLDER-ID</code>.'],
  ['Check your accounts', '<a href="#/gateway/get-balances">Get balances</a> and <a href="#/gateway/list-accounts">List accounts</a>: the account number you pay from.'],
  ['Send payouts', 'One call per payout. See <a href="#/guide/payouts">Sending a payout</a>.'],
  ['Track them', 'Check each payout\'s <code>transactionStatus</code>. See <a href="#/guide/statuses">Tracking a payout</a>.'],
])}
<h2>Where things are</h2>
${table(['API', 'Base URL'], [
  ['Auth API', `<code>${BASE_URLS.auth}</code>`],
  ['Gateway API', `<code>${GW}</code>`],
])}
${next('#/guide/quickstart', 'Quickstart')}`;

GD.quickstart = () => `<h1>Quickstart</h1>
<p class="lead">From API key to a tracked payout in four calls. The details of each step follow in Step 1 and Step 2 of this guide.</p>
<h2>1. Get a token <small class="muted">· Auth API</small></h2>
${code(`curl -X POST '${TOKEN_URL}' \\
  -H 'Authorization: Basic <encodedKey>' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  --data 'grant_type=client_credentials'`, 'bash')}
<p>The response has <code>access_token</code>, <code>expires_in</code> (seconds) and <code>userId</code>.</p>
<h2>2. Check your balance <small class="muted">· Gateway API</small></h2>
${code(`curl '${GW}/accounts/balances' \\
  -H 'Authorization: Bearer <access_token>' \\
  -H 'X-ACCOUNT-HOLDER-ID: <account holder ID>'`, 'bash')}
<h2>3. Send a payout <small class="muted">· Gateway API</small></h2>
<p>For example, an INR payout to an Indian bank account. Every field is on <a href="#/gateway/inr-payout">INR payout</a>.</p>
${code(`curl -X POST '${GW}/transfers/outbound-cbs' \\
  -H 'Authorization: Bearer <access_token>' \\
  -H 'X-ACCOUNT-HOLDER-ID: <account holder ID>' \\
  -H 'Content-Type: application/json' \\
  --data '{
    "uniqueTransactionReference": "PO-20261123-0001",
    "reference": "INV-10023",
    "amount": { "value": 1500, "currency": "INR" },
    "sourceAccountNumber": "1234567890",
    "recipientName": "Asha Verma", "receiverType": "INDIVIDUAL",
    "accountNumber": "50100012345678", "bankIfsc": "HDFC0000123", "bankName": "HDFC Bank",
    "countryCode": "IN", "residenceCountry": "IN",
    "description": "Salary November", "relation": "Employee", "reason": "Salary",
    "senderFullName": "Daniel Moore", "senderDob": "14/03/1985", "senderIdNumber": "P1234567",
    "senderAddress": "10 King Street", "senderCountryCode": "GB", "senderType": "INDIVIDUAL"
  }'`, 'bash')}
<h2>4. Check the status <small class="muted">· Gateway API</small></h2>
${code(`curl '${GW}/transactions/ref/INV-10023' \\
  -H 'Authorization: Bearer <access_token>' \\
  -H 'X-ACCOUNT-HOLDER-ID: <account holder ID>'`, 'bash')}
<p>Read <code>transactionStatus</code>: see <a href="#/guide/statuses">Tracking a payout</a>.</p>
${next('#/guide/authentication', 'Step 1: Auth API')}`;

/* ---------- step 1: auth api ---------- */
GD.authentication = () => `<h1>Step 1 · Auth API</h1>
<p class="lead">Before any Gateway call, your server signs in with the Auth API and gets an access token.</p>
${ramp([['API key', 'created once'], ['POST /oauth/gettoken', 'hub'], ['access_token', 'valid for expires_in seconds']])}
<h2>What you will do</h2>
${table(['', 'Task', 'Endpoint'], [
  ['1', '<a href="#/guide/api-keys">Get your API key</a>', 'POST /api-keys'],
  ['2', '<a href="#/guide/tokens">Get an access token</a>', 'POST /oauth/gettoken'],
  ['3', '<a href="#/guide/token-lifecycle">Keep the token valid</a>', 'POST /oauth/token/refresh, DELETE /oauth/token'],
  ['4', '<a href="#/guide/two-factor">Two-factor authentication</a>', 'POST, PUT and DELETE /me/totp (users only)'],
])}
<h2>Base URL</h2>
${code(BASE_URLS.auth, 'text')}
${next('#/guide/api-keys', 'Get your API key')}`;

GD['api-keys'] = () => `<h1>Get your API key</h1>
<p class="lead">An API key is the credential sent as HTTP Basic to get a token (<code>grant_type=client_credentials</code>).</p>
<h2>Create it</h2>
<p><a href="#/auth/create-an-api-key">Create an API key</a> creates a key for the account holder in context, with the given permission groups:</p>
${code(`curl -X POST '${BASE_URLS.auth}/api-keys' \\
  -H 'Authorization: Bearer <access_token of a signed-in user>' \\
  -H 'Content-Type: application/json' \\
  --data '{
    "description": "Payments integration key",
    "apiKeyType": "API",
    "permissionGroupIds": ["<permission group id>"]
  }'`, 'bash')}
<h2>What you get back</h2>
${table(['Field', 'What it is'], [
  ['<code>id</code>', 'Unique identifier of the API key.'],
  ['<code>password</code>', 'Generated secret of the API key.'],
  ['<code>encodedKey</code>', 'Base64 encoded <code>id:password</code>, used as the Basic authorization credential when requesting a token.'],
])}
${callout('<p><b>Returned only once.</b> <code>password</code> and <code>encodedKey</code> are sensitive, returned only at creation time and must be stored securely. The secret key is never returned by <a href="#/auth/get-api-keys">Get API keys</a>.</p>', 'warn')}
<h2>Permissions</h2>
<p><code>permissionGroupIds</code>: the permission groups assigned to the key. <code>apiKeyType</code> is <code>API</code>; <code>SYSTEM</code> keys can only be managed by admins. See <a href="#/auth/get-permission-groups">Get permission groups</a>.</p>
<h2>Manage your keys</h2>
${table(['To', 'Use'], [
  ['List your keys', '<a href="#/auth/get-api-keys">Get API keys</a>'],
  ['Change a key\'s description', '<a href="#/auth/update-api-key-description">Update API key description</a>'],
  ['Delete a key', '<a href="#/auth/delete-api-key">Delete API key</a>: tokens can no longer be requested with it'],
])}
${next('#/guide/tokens', 'Get an access token')}`;

GD.tokens = () => `<h1>Get an access token</h1>
<p class="lead">Exchange your API key for an access token with <a href="#/auth/get-a-token">POST /oauth/gettoken</a>.</p>
<h2>The request</h2>
${code(`curl -X POST '${TOKEN_URL}' \\
  -H 'Authorization: Basic <encodedKey>' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  --data 'grant_type=client_credentials'`, 'bash')}
${table(['Part', 'Value'], [
  ['<code>Authorization</code>', '<code>Basic &lt;encodedKey&gt;</code>: the <code>encodedKey</code> of your API key'],
  ['<code>grant_type</code>', '<code>client_credentials</code> (always required; may also be sent as a query parameter)'],
])}
<h2>The response</h2>
${code(`{
  "username": "john.doe@example.com",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "associations": [ ... ]
}`)}
${table(['Field', 'Use it for'], [
  ['<code>access_token</code>', 'JWT access token to be sent as a Bearer token on subsequent requests.'],
  ['<code>expires_in</code>', 'Token expiration time in seconds.'],
  ['<code>userId</code>', 'Unique identifier of the authenticated user. The <code>X-ACCOUNT-HOLDER-ID</code> value is typically received here; it is provided by Support.'],
  ['<code>associations</code>', 'Account holders associated with the user or API key.'],
])}
<h2>If it fails</h2>
${table(['Status', 'Meaning'], [
  ['<code>400</code>', 'Invalid Authorization header, grant type, body or credentials.'],
  ['<code>401</code>', 'Request originates from a restricted IP address.'],
  ['<code>403</code>', 'Account is disabled or expired.'],
  ['<code>423</code>', 'Account is locked.'],
  ['<code>428</code>', 'TOTP code required (send <code>X-TOTP-CODE</code>): see <a href="#/guide/two-factor">Two-factor authentication</a>.'],
])}
<p class="muted"><a href="#/auth/get-a-token-with-permissions">POST /oauth/token</a> issues the token including the user\'s associations with their permission groups and permissions; it is used by the front end. <code>/oauth/gettoken</code> is the token response for external clients.</p>
${next('#/guide/token-lifecycle', 'Keep the token valid')}`;

GD['token-lifecycle'] = () => `<h1>Keep the token valid</h1>
<p class="lead">A token expires after <code>expires_in</code> seconds.</p>
${steps([
  ['Refresh it', '<a href="#/auth/refresh-a-token">POST /oauth/token/refresh</a> issues a new token for the user or API key of the current, still valid, token.'],
  ['If it has expired', 'Request a new one with your API key: <a href="#/auth/get-a-token">POST /oauth/gettoken</a>.'],
  ['Revoke it', '<a href="#/auth/revoke-a-token">DELETE /oauth/token</a> invalidates the current token of the authenticated user or API key.'],
])}
<h2>Example: a token helper</h2>
${tabs([
  ['Node.js', code(`let token = null, expiresAt = 0;

async function getToken() {
  if (token && Date.now() < expiresAt - 60000) return token;   // still valid for over a minute
  const res = await fetch('${TOKEN_URL}', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + process.env.PF_ENCODED_KEY,
               'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('Token request failed: ' + res.status);
  const t = await res.json();
  token = t.access_token;
  expiresAt = Date.now() + t.expires_in * 1000;
  return token;
}

// every Gateway call
const res = await fetch('${GW}/accounts/balances', {
  headers: { 'Authorization': 'Bearer ' + await getToken(),
             'X-ACCOUNT-HOLDER-ID': process.env.PF_ACCOUNT_HOLDER_ID },
});`, 'js')],
  ['Python', code(`import os, time, requests

_token, _expires_at = None, 0

def get_token():
    global _token, _expires_at
    if _token and time.time() < _expires_at - 60:   # still valid for over a minute
        return _token
    r = requests.post("${TOKEN_URL}",
        headers={"Authorization": "Basic " + os.environ["PF_ENCODED_KEY"]},
        data={"grant_type": "client_credentials"})
    r.raise_for_status()
    t = r.json()
    _token, _expires_at = t["access_token"], time.time() + t["expires_in"]
    return _token

# every Gateway call
r = requests.get("${GW}/accounts/balances", headers={
    "Authorization": "Bearer " + get_token(),
    "X-ACCOUNT-HOLDER-ID": os.environ["PF_ACCOUNT_HOLDER_ID"]})`, 'python')],
])}
${next('#/guide/gateway', 'Step 2: Gateway API')}`;

GD['two-factor'] = () => `<h1>Two-factor authentication</h1>
<p class="lead">For users who sign in with <code>grant_type=password</code>.</p>
<h2>Turn it on</h2>
${steps([
  ['Generate the code', '<a href="#/auth/generate-totp-qr-code-for-the-current-user">POST /me/totp</a> returns an <code>otpauth://</code> URL. to render as a QR code. Two-factor is not enforced until it is activated.'],
  ['Activate it', '<a href="#/auth/activate-totp-for-the-current-user">PUT /me/totp</a> validates a TOTP code from the authenticator and activates two-factor authentication.'],
])}
<h2>Sign in with it</h2>
<p>With <code>grant_type=password</code>, send <code>username</code> and <code>password</code> in the body and the current TOTP code in the <code>X-TOTP-CODE</code> header, otherwise the request fails with <code>428</code>.</p>
<h2>Turn it off</h2>
<p><a href="#/auth/deactivate-totp-for-the-current-user">DELETE /me/totp</a> with the current code in <code>X-TOTP-CODE</code>. To deactivate it for another user, for example when they lost their authenticator: <a href="#/auth/remove-totp-for-user">Remove TOTP for user</a>.</p>`;

/* ---------- step 2: gateway api ---------- */
GD.gateway = () => `<h1>Step 2 · Gateway API</h1>
<p class="lead">With a token from step 1, the Gateway API does the work: accounts, payouts, beneficiaries, transactions and reports.</p>
<h2>Every call</h2>
${code(`${GW}/<path>

Authorization: Bearer <access_token>
X-ACCOUNT-HOLDER-ID: <account holder ID>
Content-Type: application/json        (when there is a body)`, 'http')}
${table(['Header', 'Where it comes from'], [
  ['<code>Authorization</code>', 'The <code>access_token</code> from <a href="#/guide/tokens">step 1</a>.'],
  ['<code>X-ACCOUNT-HOLDER-ID</code>', 'Provided by Support; typically received in the token response as <code>userId</code>.'],
])}
<h2>What you will do</h2>
${table(['', 'Task', 'Endpoints'], [
  ['1', '<a href="#/guide/accounts">Check accounts and balances</a>', '<a href="#/gateway/get-balances">Get balances</a>, <a href="#/gateway/list-accounts">List accounts</a>'],
  ['2', '<a href="#/guide/payouts">Send payouts</a>', '<a href="#/gateway/inr-payout">INR</a>, <a href="#/gateway/pkr-payout">PKR</a>, <a href="#/gateway/payout-to-a-saved-beneficiary">saved beneficiary</a>'],
  ['3', '<a href="#/guide/statuses">Track them</a>', '<a href="#/gateway/get-a-transaction-by-your-reference">Get a transaction by your reference</a>'],
  ['4', '<a href="#/guide/reports">Reconcile and report</a>', '<a href="#/gateway/list-transactions">List transactions</a>, statements and exports'],
])}
${next('#/guide/accounts', 'Accounts and balances')}`;

GD.accounts = () => `<h1>Accounts and balances</h1>
<p class="lead">Your first Gateway calls: what you hold, and which account you pay from.</p>
<h2>Your balances</h2>
<p><a href="#/gateway/get-balances">GET /accounts/balances</a> retrieves the balances of all accessible accounts: <code>globalBalance</code> (the total global balance across all accounts) and <code>balances</code> (one per currency).</p>
<h2>Your accounts</h2>
<p><a href="#/gateway/list-accounts">GET /accounts</a> lists your accounts. Each has:</p>
${table(['Field', 'What it is'], [
  ['<code>accountNumber</code>', 'The account number. Payouts take it as <code>sourceAccountNumber</code>.'],
  ['<code>currencyCode</code>', 'The currency code for the account.'],
  ['<code>availableBalance</code>', 'The available balance of the account.'],
  ['<code>actualBalance</code>', 'The actual balance of the account.'],
  ['<code>accountStatus</code>', '<code>ACTIVE</code>, <code>CLOSED</code>, <code>DELETED</code> or <code>PENDING</code>.'],
])}
${next('#/guide/payouts', 'Sending a payout')}`;

GD.payouts = () => `<h1>Sending a payout</h1>
<p class="lead">Pick the endpoint, send the payout, then check its status.</p>
<h2>1. Pick the endpoint</h2>
${table(['Paying', 'Use', 'Beneficiary first?'], [
  ['An Indian bank account (INR)', '<a href="#/gateway/inr-payout">INR payout</a>', 'No'],
  ['A Pakistani bank account, Easypaisa or JazzCash wallet (PKR)', '<a href="#/gateway/pkr-payout">PKR payout</a>', 'No'],
  ['A saved beneficiary, for example in EUR', '<a href="#/gateway/payout-to-a-saved-beneficiary">Payout to a saved beneficiary</a>', 'Yes: <a href="#/guide/beneficiaries">Beneficiaries</a>'],
])}
<h2>2. Fill in the payout</h2>
${table(['Part', 'Fields'], [
  ['Your references', '<code>uniqueTransactionReference</code> (your unique identifier for the transaction, used for idempotency) and <code>reference</code> (your own reference)'],
  ['Amount and source', '<code>amount</code> (<code>value</code> and <code>currency</code>) and <code>sourceAccountNumber</code> from <a href="#/guide/accounts">your accounts</a>'],
  ['Purpose', '<code>description</code>, <code>reason</code>, <code>relation</code> (sender to recipient)'],
  ['Recipient', '<code>recipientName</code>, <code>receiverType</code>, <code>countryCode</code>, <code>residenceCountry</code>, and the bank or wallet details'],
  ['Sender', '<code>senderFullName</code>, <code>senderAddress</code>, <code>senderIdNumber</code>, <code>senderCountryCode</code>, <code>senderType</code>; <code>senderDob</code> too when <code>senderType</code> is <code>INDIVIDUAL</code>'],
])}
<h2>INR: bank details</h2>
<p><code>accountNumber</code>, <code>bankIfsc</code> and <code>bankName</code>. See <a href="#/gateway/inr-payout">INR payout</a>.</p>
<h2>PKR: bank account or wallet</h2>
${table(['paymentMethod', 'paymentDetails'], [
  ['<code>EASYPAISA</code>, <code>JAZZCASH</code>', '<code>walletNumber</code> (11 digits, starts with 0) and <code>documentId</code> (the recipient\'s CNIC)'],
  ['<code>BANK_TRANSFER</code>', '<code>accountNumber</code> (IBAN: 24 characters, starts with PK), <code>accountName</code> and <code>bankCode</code> from the supported list'],
])}
<h2>EUR: verify the account first</h2>
<p><a href="#/gateway/verify-a-beneficiary-account">Verify the beneficiary account</a> (IBAN, BIC and name), then send the returned <code>id</code> as <code>beneficiaryAccountVerificationId</code>. It is mandatory for EUR payouts.</p>
<h2>3. Check the status</h2>
<p>The response is the transaction, with its <code>transactionStatus</code>. See <a href="#/guide/statuses">Tracking a payout</a>.</p>
${next('#/guide/statuses', 'Tracking a payout')}`;

GD.statuses = () => `<h1>Tracking a payout</h1>
<p class="lead">Every transaction has a <code>transactionStatus</code>.</p>
<h2>Check the status</h2>
${code(`curl '${GW}/transactions/ref/INV-10023' \\
  -H 'Authorization: Bearer <access_token>' \\
  -H 'X-ACCOUNT-HOLDER-ID: <account holder ID>'`, 'bash')}
<p>By your <code>reference</code> (<a href="#/gateway/get-a-transaction-by-your-reference">Get a transaction by your reference</a>) or by the transaction <code>id</code> (<a href="#/gateway/get-a-transaction">Get a transaction</a>).</p>
<h2>Statuses</h2>
<p>${['CREATED', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING', 'PENDING', 'COMPLETED', 'DECLINED', 'FAILED', 'CANCELLED'].map(s => `<code>${s}</code>`).join(' ')}</p>
<p class="muted"><code>INITIAL</code>, <code>PENDING_CONFIRMATION</code> and <code>EXPIRED</code> are deprecated.</p>
<p>If the transaction failed, <code>errorCode</code>, <code>errorMessage</code> and <code>errorId</code> are set. To check many transactions, use <a href="#/gateway/list-transactions">List transactions</a> with filters such as <code>transactionStatus</code>, <code>startDateTime</code> and <code>endDateTime</code>.</p>
${next('#/guide/beneficiaries', 'Beneficiaries')}`;

GD.beneficiaries = () => `<h1>Beneficiaries</h1>
<p class="lead">Save a beneficiary, then pay it by <code>beneficiaryId</code>.</p>
${steps([
  ['Create', '<a href="#/gateway/create-a-beneficiary">Create a beneficiary</a> with the bank details (IBAN and SWIFT, or account number and routing code) and address.'],
  ['Approve or reject', '<a href="#/gateway/approve-a-beneficiary">Approve</a> a previously created beneficiary, or <a href="#/gateway/reject-a-beneficiary">reject</a> it (marks it as deleted). Its <code>approved</code> field shows whether it has been approved.'],
  ['Verify (EUR)', '<a href="#/gateway/verify-a-beneficiary-account">Verify the account</a>: <code>MATCH</code>, <code>CLOSE_MATCH</code> (with <code>matchedName</code>), <code>NO_MATCH</code>, <code>NOT_APPLICABLE</code> or <code>NOT_VERIFIED</code>.'],
  ['Pay', '<a href="#/gateway/payout-to-a-saved-beneficiary">Payout to a saved beneficiary</a>.'],
])}
${next('#/guide/reports', 'Reports')}`;

GD.reports = () => `<h1>Reports</h1>
<p class="lead">Statements, proof of funds, transaction exports and receipts, as PDF or CSV.</p>
<h2>Small ranges: straight away</h2>
<p><a href="#/gateway/account-report-pdf">Account report</a>, <a href="#/gateway/transactions-report-pdf">Transactions report (PDF)</a>, <a href="#/gateway/transactions-report-csv">Transactions report (CSV)</a> and <a href="#/gateway/transaction-receipt-pdf">Transaction receipt</a> return the file.</p>
<h2>Large ranges: request, then download</h2>
${steps([
  ['Request it', '<a href="#/gateway/request-an-account-report">Request an account report</a>, or add <code>async=true</code> to the endpoints above. You get a <code>reportGenerationId</code>.'],
  ['Wait for it', '<a href="#/gateway/get-report-status">Get report status</a> until it is <code>COMPLETED</code>. You also get an email when it is ready.'],
  ['Download it', '<a href="#/gateway/download-a-report">Download a report</a>.'],
])}
<h2>Reconciliation</h2>
<p><a href="#/gateway/list-transactions">List transactions</a> with a date range (<code>startDateTime</code>, <code>endDateTime</code>), page by page.</p>
${next('#/guide/checklist', 'Go-live checklist')}`;

/* ---------- reference ---------- */
GD.requests = () => `<h1>Making requests</h1>
<h2>Format</h2>
<p>Bodies are JSON (<code>application/json</code>), except the token requests (<code>application/x-www-form-urlencoded</code>) and branding templates (<code>multipart/form-data</code>). Amounts are an object:</p>
${code('"amount": { "value": 1500, "currency": "INR" }')}
<h2>Your two references</h2>
${table(['Field', 'What it is for'], [
  ['<code>uniqueTransactionReference</code>', 'The transaction\'s unique identifier provided by you, used for idempotency.'],
  ['<code>reference</code>', 'Your own reference for the transaction. Fetch the transaction with <a href="#/gateway/get-a-transaction-by-your-reference">Get a transaction by your reference</a>.'],
])}
<h2>Lists and pages</h2>
${code('GET /transactions?transactionStatus=COMPLETED&page=0&size=50&sort=createdDateTime,desc', 'http')}
<p>Paging uses <code>page</code>, <code>size</code> and <code>sort</code>. The items are in <code>content</code>, with <code>totalElements</code>, <code>totalPages</code>, <code>number</code>, <code>first</code> and <code>last</code>.</p>`;

GD.errors = () => `<h1>Errors</h1>
<p class="lead">Errors return this body (<code>ApiError</code>).</p>
${code(JSON.stringify(ERROR_EXAMPLE, null, 2))}
${table(['Field', 'Use it to'], [
  ['<code>errorCode</code>, <code>message</code>', 'The error.'],
  ['<code>fieldErrors</code>', 'Each invalid field: <code>fieldName</code> and <code>errorMessage</code>.'],
  ['<code>traceId</code>, <code>errorId</code>', 'Identify the error.'],
])}
<h2>Auth API</h2>
${table(['Code', 'Meaning'], [
  ['<code>400</code>', 'Invalid Authorization header, grant type, body or credentials.'],
  ['<code>401</code>', 'Token request from a restricted IP address.'],
  ['<code>403</code>', 'Account disabled or expired.'],
  ['<code>423</code>', 'Account locked.'],
  ['<code>428</code>', 'Two-factor code required: send <code>X-TOTP-CODE</code>.'],
])}
<h2>Gateway API</h2>
${table(['Code', 'Meaning'], [
  ['<code>200</code>', 'Success.'],
  ['<code>202</code>', 'Accepted: a report is being generated (<code>async=true</code>).'],
  ['<code>400</code>', 'Bad Request, with the error body.'],
])}
<h2>Failed transactions</h2>
<p>A transaction that failed carries <code>errorCode</code>, <code>errorMessage</code> and <code>errorId</code>. See <a href="#/guide/statuses">Tracking a payout</a>.</p>`;

GD.team = () => `<h1>Users and permissions</h1>
<p class="lead">Users, invitations and permissions are managed in the <a href="#/auth/start">Auth API</a>.</p>
${table(['To', 'Use'], [
  ['Invite a person', '<a href="#/auth/create-a-user-invitation">Create a user invitation</a>'],
  ['Set what they can do', '<a href="#/auth/update-permissions-of-a-linked-user">Update permissions of a linked user</a>'],
  ['See the permission groups', '<a href="#/auth/get-permission-groups">Get permission groups</a>'],
  ['See who you are signed in as', '<a href="#/auth/get-current-logged-in-user-details">Get current logged-in user details</a>'],
  ['Change your password', '<a href="#/auth/change-password-for-the-current-user">Change password for the current user</a>'],
])}`;

/* ---------- go live ---------- */
GD.checklist = () => `<h1>Go-live checklist</h1>
<p class="lead">Check each step before you go live.</p>
<h2>Step 1 · Auth API</h2>
${steps([
  ['API key stored securely', '<code>password</code> and <code>encodedKey</code> are returned only once, at creation time.'],
  ['Token requested', '<code>POST /oauth/gettoken</code> with <code>Authorization: Basic &lt;encodedKey&gt;</code> and <code>grant_type=client_credentials</code>.'],
  ['Token refreshed', 'With <code>POST /oauth/token/refresh</code> while it is still valid (<code>expires_in</code> seconds).'],
  ['Token errors handled', '<code>400</code>, <code>401</code>, <code>403</code>, <code>423</code> and <code>428</code>.'],
])}
<h2>Step 2 · Gateway API</h2>
${steps([
  ['Both headers on every call', '<code>Authorization: Bearer &lt;access_token&gt;</code> and <code>X-ACCOUNT-HOLDER-ID</code>.'],
  ['Source account', '<code>sourceAccountNumber</code> from <a href="#/gateway/list-accounts">List accounts</a>.'],
  ['A uniqueTransactionReference on every payout', 'Your unique identifier for the transaction, used for idempotency.'],
  ['Status checked', '<code>transactionStatus</code> with <a href="#/gateway/get-a-transaction-by-your-reference">Get a transaction by your reference</a>.'],
  ['Errors handled', 'The error body: <code>errorCode</code>, <code>message</code>, <code>fieldErrors</code>, <code>traceId</code>.'],
])}`;

/* ---------- help ---------- */
GD.faq = () => {
  const q = (t, a) => `<details class="faq"><summary>${t}</summary>${a}</details>`;
  return `<h1>FAQ</h1>
${q('Do I need both APIs?', '<p>Yes. The Auth API gives you the token; every Gateway API call needs it.</p>')}
${q('Which token endpoint do I use?', '<p><a href="#/auth/get-a-token">POST /oauth/gettoken</a>: the token response for external clients. <code>/oauth/token</code> is used by the front end.</p>')}
${q('What goes in the Basic header?', '<p>The <code>encodedKey</code> you got when the API key was created: Base64 of <code>id:password</code>.</p>')}
${q('I lost the API key secret.', '<p>The secret is returned only once, when the key is created, and is never returned again. You can <a href="#/auth/delete-api-key">delete the key</a> and <a href="#/auth/create-an-api-key">create a new one</a>.</p>')}
${q('Where do I get the account holder ID?', '<p>It is provided by Support, and typically received in the token response as <code>userId</code>.</p>')}
${q('How long does a token last?', '<p><code>expires_in</code> seconds. Refresh it before then with <a href="#/auth/refresh-a-token">Refresh a token</a>.</p>')}
${q('What is uniqueTransactionReference for?', '<p>It is your unique identifier for the transaction, used for idempotency.</p>')}
${q('My report request times out.', '<p>Add <code>async=true</code>, or use <a href="#/gateway/request-an-account-report">Request an account report</a>, then download it when it is ready.</p>')}`;
};

GD.support = () => `<h1>Support</h1>
<p class="lead">Your OAuth2 details and account holder ID are provided by Support.</p>
<h2>Include</h2>
${steps([
  ['Which API and endpoint', 'Auth or Gateway, the method and path, and the time of the call (with time zone).'],
  ['The traceId', 'From the error response.'],
  ['Your references', '<code>reference</code> and <code>uniqueTransactionReference</code>, or the transaction <code>id</code>.'],
])}
${callout('<p>Never send your API key, password or token to anyone, support included.</p>', 'warn')}`;

GD.glossary = () => {
  const dl = rows => `<dl class="glossary">${rows.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl>`;
  return `<h1>Glossary</h1>${dl([
    ['Access token', 'A JWT from the Auth API, sent as <code>Authorization: Bearer</code> on every Gateway call.'],
    ['Account holder', 'Your business on the platform. Sent as <code>X-ACCOUNT-HOLDER-ID</code>.'],
    ['API key', 'Your integration\'s credential. Its <code>encodedKey</code> is exchanged for a token.'],
    ['Auth API', 'Sign-in, API keys, users and permissions.'],
    ['Beneficiary', 'A saved recipient you can pay by <code>beneficiaryId</code>.'],
    ['CNIC', 'Pakistani national identity card number.'],
    ['encodedKey', 'Base64 of the API key\'s <code>id:password</code>. Shown once.'],
    ['Gateway API', 'Accounts, payouts, beneficiaries, transactions and reports.'],
    ['IBAN', 'International bank account number.'],
    ['IFSC', 'Indian bank branch code.'],
    ['TOTP', 'Time-based one-time password: the six-digit two-factor code.'],
    ['uniqueTransactionReference', 'Your unique ID for a payout, which makes retries safe.'],
  ])}`;
};
