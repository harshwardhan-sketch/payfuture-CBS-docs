/* Values used on several pages. Loaded first. */
const PRODUCT = 'Payfuture Banking API';
const PRODUCT_SHORT = 'Banking API';
/* the two APIs, as in the live API reference (docs.payfuturefs.com) */
const BASE_URLS = {
  auth: 'https://secure-mtapi.payfuturefs.com/auth',
  gateway: 'https://secure-mtapi.payfuturefs.com/gateway',
};
/* the token endpoint for integrations (the token response for external clients; POST /oauth/token is used by the front end) */
const TOKEN_URL = BASE_URLS.auth + '/oauth/gettoken';
