/* Example values shown on the API pages.
   EXAMPLES: request bodies keyed by "METHOD /path": a list of [title, body]. Endpoints not listed get an example
   built from the example values in the spec. Use realistic values, never real customer data, never "dummy". */
const SENDER = {
  senderFullName: 'Daniel Moore', senderDob: '14/03/1985', senderNationality: 'GB',
  senderIdNumber: 'P1234567', senderAddress: '10 King Street', senderCity: 'London',
  senderPostCode: 'EC2V 8AA', senderCountryCode: 'GB', senderType: 'INDIVIDUAL',
};

const EXAMPLES = {
  'POST /oauth/token': [['With an API key', {grant_type: 'client_credentials'}]],
  'POST /oauth/gettoken': [['With an API key', {grant_type: 'client_credentials'}]],
  'POST /transfers/outbound-cbs': [['Bank account', {
    uniqueTransactionReference: 'PO-20261123-0001', amount: {value: 1500, currency: 'INR'},
    reference: 'INV-10023', sourceAccountNumber: '1234567890',
    description: 'Salary November', relation: 'Employee', reason: 'Salary',
    recipientName: 'Asha Verma', receiverType: 'INDIVIDUAL', accountNumber: '50100012345678',
    bankIfsc: 'HDFC0000123', bankName: 'HDFC Bank', city: 'Mumbai', postcode: '400001',
    countryCode: 'IN', residenceCountry: 'IN', ...SENDER,
  }]],
  'POST /transfers/outbound-cbs/pkr': [
    ['Easypaisa or JazzCash wallet', {
      uniqueTransactionReference: 'PO-20261123-0002', amount: {value: 11440, currency: 'PKR'},
      reference: 'INV-10024', sourceAccountNumber: '1234567890',
      description: 'Family support', relation: 'Brother', reason: 'Family support',
      recipientName: 'Ali Khan', receiverType: 'INDIVIDUAL', countryCode: 'PK', residenceCountry: 'PK',
      paymentMethod: 'EASYPAISA', paymentDetails: {walletNumber: '03001234567', documentId: '3520112345671'},
      ...SENDER,
    }],
    ['Bank transfer (IBAN)', {
      uniqueTransactionReference: 'PO-20261123-0003', amount: {value: 11440, currency: 'PKR'},
      reference: 'INV-10025', sourceAccountNumber: '1234567890',
      description: 'Invoice 553', relation: 'Supplier', reason: 'Goods',
      recipientName: 'Ali Khan', receiverType: 'INDIVIDUAL', countryCode: 'PK', residenceCountry: 'PK',
      paymentMethod: 'BANK_TRANSFER',
      paymentDetails: {accountNumber: 'PK36SCBL0000001123456702', accountName: 'Ali Khan', bankCode: 'PK005'},
      ...SENDER,
    }],
  ],
  'POST /transfers/outbound': [['Saved beneficiary (EUR)', {
    uniqueTransactionReference: 'PO-20261123-0004', amount: {value: 250, currency: 'EUR'},
    reference: 'INV-10026', sourceAccountNumber: '1234567890',
    beneficiaryId: '3f6c2a10-8b1e-4c2d-9a51-0d4e7b9c1a22',
    beneficiaryAccountVerificationId: '9b2e4f60-1c3d-4e5f-8a7b-6c5d4e3f2a11',
    description: 'Invoice 554', relation: 'Supplier', reason: 'Services',
    senderCountryCode: 'GB', senderFullName: 'Daniel Moore', senderType: 'INDIVIDUAL',
  }]],
  'POST /transfers/internal': [['Between your accounts', {
    uniqueTransactionReference: 'IT-20261123-0001', amount: {value: 1000, currency: 'EUR'},
    reference: 'Top up', sourceAccountNumber: '1234567890', destinationAccountNumber: '1234567891',
    description: 'Move funds to payout account', transactionType: 'SELF_TRANSFER',
  }]],
  'POST /beneficiary-account-verifications': [['IBAN check', {
    iban: 'DE89370400440532013000', bic: 'COBADEFFXXX', beneficiaryName: 'Anna Schmidt',
  }]],
};

/* Values put into the URL of the examples, by path parameter name. */
const PATH_EXAMPLES = {source: 'EUR', destination: 'INR', reference: 'INV-10023', accountNumber: '1234567890'};

/* Fields that depend on another field, which the spec cannot express: [label, schema to show]. */
const VARIANTS = {
  PkrPaymentDetails: [['When paymentMethod is EASYPAISA or JAZZCASH', 'WalletPaymentDetails'],
                      ['When paymentMethod is BANK_TRANSFER', 'BankTransferPaymentDetails']],
};

/* The error body shown in the code panel (fields from the spec, sample values). */
const ERROR_EXAMPLE = {
  requestPath: '/gateway/transfers/outbound-cbs', httpStatus: 400, httpMethod: 'POST',
  errorCode: '<errorCode>', message: '<what went wrong>',
  timestamp: '2026-11-23T10:15:30Z', traceId: '<traceId>', errorId: 0,
  fieldErrors: [{fieldName: 'bankIfsc', errorMessage: '<why the field is invalid>'}],
};
