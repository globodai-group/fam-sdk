<p align="center">
  <img src="https://img.shields.io/badge/FAM-SDK-0066FF?style=for-the-badge&logoColor=white" alt="FAM SDK" height="40">
</p>

<h1 align="center">FAM SDK</h1>

<p align="center">
  <strong>Official TypeScript SDK for the FAM API</strong><br>
  <em>A type-safe, developer-friendly wrapper for Mangopay payment services</em>
</p>

<p align="center">
  <a href="https://github.com/globodai-group/@globodai/fam-sdk/actions/workflows/ci.yml"><img src="https://github.com/globodai-group/@globodai/fam-sdk/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@globodai/fam-sdk"><img src="https://img.shields.io/npm/v/@globodai/fam-sdk.svg?color=0066FF&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@globodai/fam-sdk"><img src="https://img.shields.io/npm/dm/@globodai/fam-sdk.svg?color=green&label=downloads" alt="npm downloads"></a>
  <a href="https://bundlephobia.com/package/@globodai/fam-sdk"><img src="https://img.shields.io/bundlephobia/minzip/@globodai/fam-sdk?label=size&color=orange" alt="bundle size"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#webhooks">Webhooks</a> •
  <a href="#error-handling">Error Handling</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Highlights

- **Full TypeScript Support** — Strict types for all API requests and responses
- **Zero Dependencies** — Lightweight and secure, no external runtime dependencies
- **Dual Module Support** — Works with both ESM and CommonJS
- **Automatic Retries** — Built-in retry logic with exponential backoff
- **Comprehensive Errors** — Typed error classes for precise error handling
- **Webhook Verification** — Secure signature verification out of the box

## Requirements

- Node.js 18.0.0 or higher
- TypeScript 5.0+ (recommended)

## Installation

```bash
npm install @globodai/fam-sdk
```

<details>
<summary>Using other package managers</summary>

```bash
# yarn
yarn add @globodai/fam-sdk

# pnpm
pnpm add @globodai/fam-sdk
```

</details>

## Quick Start

```typescript
import { Fam } from '@globodai/fam-sdk';

// Initialize the client
const fam = new Fam({
  baseUrl: 'https://api.fam.com',
  token: 'your-auth-token',
});

// Create a user
const user = await fam.users.createNatural({
  Email: 'john.doe@example.com',
  FirstName: 'John',
  LastName: 'Doe',
  Birthday: 631152000,
  Nationality: 'FR',
  CountryOfResidence: 'FR',
});

// Create a wallet
const wallet = await fam.wallets.create({
  Owners: [user.Id],
  Description: 'Main wallet',
  Currency: 'EUR',
});

console.log(`Wallet created: ${wallet.Id}`);
```

## Configuration

```typescript
import { Fam } from '@globodai/fam-sdk';
import type { FamOptions } from '@globodai/fam-sdk';

const options: FamOptions = {
  baseUrl: 'https://api.fam.com',
  token: 'your-auth-token',
  timeout: 30000, // Request timeout in ms (default: 30000)
  retries: 3,     // Retry attempts on network errors (default: 3)
};

const fam = new Fam(options);
```

## API Reference

### Users

<details open>
<summary><strong>Natural Users</strong></summary>

```typescript
// Create a natural user
const user = await fam.users.createNatural({
  Email: 'user@example.com',
  FirstName: 'John',
  LastName: 'Doe',
  Birthday: 631152000,
  Nationality: 'FR',
  CountryOfResidence: 'FR',
});

// Update a natural user
await fam.users.updateNatural(userId, {
  FirstName: 'Jane',
});

// Get user details
const user = await fam.users.getUser(userId);
const naturalUser = await fam.users.getNaturalUser(userId);
```

</details>

<details>
<summary><strong>Legal Users</strong></summary>

```typescript
// Create a legal user
const company = await fam.users.createLegal({
  Email: 'contact@company.com',
  Name: 'ACME Corp',
  LegalPersonType: 'BUSINESS',
  LegalRepresentativeFirstName: 'John',
  LegalRepresentativeLastName: 'Doe',
  LegalRepresentativeBirthday: 631152000,
  LegalRepresentativeNationality: 'FR',
  LegalRepresentativeCountryOfResidence: 'FR',
});

// Update and retrieve
await fam.users.updateLegal(userId, { Name: 'ACME Corporation' });
const legalUser = await fam.users.getLegalUser(userId);
```

</details>

<details>
<summary><strong>User Resources</strong></summary>

```typescript
// Get user's wallets, cards, bank accounts, and transactions
const wallets = await fam.users.getWallets(userId);
const cards = await fam.users.getCards(userId);
const bankAccounts = await fam.users.getBankAccounts(userId);
const transactions = await fam.users.getTransactions(userId);
```

</details>

### Wallets

```typescript
// Create a wallet
const wallet = await fam.wallets.create({
  Owners: [userId],
  Description: 'EUR Wallet',
  Currency: 'EUR',
});

// Get wallet details and transactions
const wallet = await fam.wallets.getWallet(walletId);
const transactions = await fam.wallets.getTransactions(walletId);
```

### Payments

<details open>
<summary><strong>Pay-ins</strong></summary>

```typescript
// Create a card direct payin
const payin = await fam.payins.create({
  AuthorId: userId,
  CreditedWalletId: walletId,
  DebitedFunds: { Amount: 1000, Currency: 'EUR' },
  Fees: { Amount: 0, Currency: 'EUR' },
  CardId: cardId,
  SecureModeReturnURL: 'https://example.com/return',
});

// Get payin details
const payin = await fam.payins.getPayin(payinId);

// Refund a payin
const refund = await fam.payins.refund(payinId, {
  AuthorId: userId,
});
```

</details>

<details>
<summary><strong>Recurring Payments</strong></summary>

```typescript
// Create recurring payment registration
const recurring = await fam.payins.createRecurringPayment({
  AuthorId: userId,
  CardId: cardId,
  CreditedWalletId: walletId,
  FirstTransactionDebitedFunds: { Amount: 1000, Currency: 'EUR' },
  FirstTransactionFees: { Amount: 0, Currency: 'EUR' },
});

// Create Customer-Initiated Transaction (CIT)
const cit = await fam.payins.createRecurringCit({
  RecurringPayinRegistrationId: recurring.Id,
  DebitedFunds: { Amount: 1000, Currency: 'EUR' },
  Fees: { Amount: 0, Currency: 'EUR' },
  SecureModeReturnURL: 'https://example.com/return',
});

// Create Merchant-Initiated Transaction (MIT)
const mit = await fam.payins.createRecurringMit({
  RecurringPayinRegistrationId: recurring.Id,
  DebitedFunds: { Amount: 1000, Currency: 'EUR' },
  Fees: { Amount: 0, Currency: 'EUR' },
});
```

</details>

<details>
<summary><strong>Pay-outs</strong></summary>

```typescript
// Create a payout to bank account
const payout = await fam.payouts.create({
  AuthorId: userId,
  DebitedWalletId: walletId,
  DebitedFunds: { Amount: 1000, Currency: 'EUR' },
  Fees: { Amount: 0, Currency: 'EUR' },
  BankAccountId: bankAccountId,
});

// Get payout details
const payout = await fam.payouts.getPayout(payoutId);
```

</details>

<details>
<summary><strong>Transfers</strong></summary>

```typescript
// Create a wallet-to-wallet transfer
const transfer = await fam.transfers.create({
  AuthorId: userId,
  DebitedWalletId: sourceWalletId,
  CreditedWalletId: targetWalletId,
  DebitedFunds: { Amount: 1000, Currency: 'EUR' },
  Fees: { Amount: 0, Currency: 'EUR' },
});

// Create SCA transfer
const scaTransfer = await fam.transfers.createSca({
  AuthorId: userId,
  DebitedWalletId: sourceWalletId,
  CreditedWalletId: targetWalletId,
  DebitedFunds: { Amount: 5000, Currency: 'EUR' },
  Fees: { Amount: 0, Currency: 'EUR' },
});

// Refund a transfer
const refund = await fam.transfers.refund(transferId, {
  AuthorId: userId,
});
```

</details>

### Cards

<details open>
<summary><strong>Card Registration</strong></summary>

```typescript
// Create card registration
const registration = await fam.cardRegistrations.create({
  UserId: userId,
  Currency: 'EUR',
  CardType: 'CB_VISA_MASTERCARD',
});

// Update with tokenized card data
const updated = await fam.cardRegistrations.update(registration.Id, {
  RegistrationData: tokenizedData,
});

// Get card from registration
const card = await fam.cards.getCard(updated.CardId);
```

</details>

<details>
<summary><strong>Card Operations</strong></summary>

```typescript
// Get card details
const card = await fam.cards.getCard(cardId);

// Deactivate a card
await fam.cards.deactivate(cardId);

// Get card preauthorizations
const preauths = await fam.cards.getPreauthorizations(cardId);
```

</details>

<details>
<summary><strong>Preauthorizations</strong></summary>

```typescript
// Create a preauthorization
const preauth = await fam.preauthorizations.create({
  AuthorId: userId,
  DebitedFunds: { Amount: 10000, Currency: 'EUR' },
  CardId: cardId,
  SecureModeReturnURL: 'https://example.com/return',
});

// Cancel a preauthorization
await fam.preauthorizations.cancel(preauthId);
```

</details>

### User-Scoped Modules

<details open>
<summary><strong>Bank Accounts</strong></summary>

```typescript
const bankAccounts = fam.bankAccounts(userId);

// Create IBAN bank account
const iban = await bankAccounts.createIban({
  OwnerName: 'John Doe',
  OwnerAddress: {
    AddressLine1: '1 rue de la Paix',
    City: 'Paris',
    PostalCode: '75001',
    Country: 'FR',
  },
  IBAN: 'FR7630004000031234567890143',
});

// List and manage
const accounts = await bankAccounts.list();
const account = await bankAccounts.getAccount(accountId);
await bankAccounts.deactivate(accountId);
```

</details>

<details>
<summary><strong>KYC Documents</strong></summary>

```typescript
const kyc = fam.kyc(userId);

// Create and submit KYC document
const document = await kyc.create({ Type: 'IDENTITY_PROOF' });
await kyc.createPage(document.Id, fileBase64);
await kyc.submit(document.Id);

// Check status
const status = await kyc.getDocument(document.Id);
```

</details>

<details>
<summary><strong>UBO Declarations</strong></summary>

```typescript
const ubo = fam.ubo(userId);

// Create UBO declaration
const declaration = await ubo.createDeclaration();

// Add Ultimate Beneficial Owner
const owner = await ubo.createUbo(declaration.Id, {
  FirstName: 'John',
  LastName: 'Doe',
  Birthday: 631152000,
  Nationality: 'FR',
  Address: {
    AddressLine1: '1 rue de la Paix',
    City: 'Paris',
    PostalCode: '75001',
    Country: 'FR',
  },
  Birthplace: { City: 'Paris', Country: 'FR' },
});

// Submit declaration
await ubo.submit(declaration.Id);
```

</details>

<details>
<summary><strong>SCA Recipients</strong></summary>

```typescript
const recipients = fam.scaRecipients(userId);

// Get schema for recipient type
const schema = await recipients.getSchema({
  PayoutMethodType: 'IBAN',
  RecipientType: 'Individual',
  Currency: 'EUR',
  Country: 'FR',
});

// Create recipient
const recipient = await recipients.create({
  DisplayName: 'John Doe - Main Account',
  PayoutMethodType: 'IBAN',
  RecipientType: 'Individual',
  Currency: 'EUR',
  // ... schema-specific fields
});
```

</details>

### Subscriptions

```typescript
// Register a subscription
const subscription = await fam.subscriptions.register({
  UserId: userId,
  WalletId: walletId,
  CardId: cardId,
  Amount: { Amount: 999, Currency: 'EUR' },
  Frequency: 'MONTHLY',
});

// Manage subscriptions
const subscriptions = await fam.subscriptions.list({ UserId: userId });
const subscription = await fam.subscriptions.getSubscription(subscriptionId);

// Lifecycle operations
await fam.subscriptions.enable(subscriptionId);
await fam.subscriptions.disable(subscriptionId);
await fam.subscriptions.cancel(subscriptionId);
```

## Webhooks

Verify and process webhook events securely:

```typescript
import { Webhooks } from '@globodai/fam-sdk/webhooks';

const webhooks = new Webhooks({
  signingSecret: process.env.WEBHOOK_SECRET,
});

// Express.js example
app.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;

  try {
    const event = webhooks.constructEvent(req.body, signature);

    switch (event.EventType) {
      case 'PAYIN_NORMAL_SUCCEEDED':
        handleSuccessfulPayin(event);
        break;
      case 'PAYIN_NORMAL_FAILED':
        handleFailedPayin(event);
        break;
      case 'KYC_SUCCEEDED':
        handleKycValidation(event);
        break;
      case 'FAM_SUBSCRIPTION_PAYMENT_SUCCEEDED':
        handleSubscriptionPayment(event);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

## Error Handling

The SDK provides typed error classes for precise error handling:

```typescript
import {
  ApiError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
} from '@globodai/fam-sdk';

try {
  const user = await fam.users.getUser('invalid-id');
} catch (error) {
  if (error instanceof NotFoundError) {
    // Resource not found (404)
    console.error('User not found');
  } else if (error instanceof AuthenticationError) {
    // Invalid or expired token (401)
    console.error('Please re-authenticate');
  } else if (error instanceof ValidationError) {
    // Invalid request data (400)
    console.error('Validation errors:', error.errors);
  } else if (error instanceof RateLimitError) {
    // Too many requests (429)
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
  } else if (error instanceof NetworkError) {
    // Connection/timeout errors
    console.error('Network error:', error.message);
  } else if (error instanceof ApiError) {
    // Other API errors
    console.error(`API error ${error.statusCode}: ${error.message}`);
  }
}
```

## TypeScript

Full type definitions are included for all API operations:

```typescript
import type {
  // Users
  NaturalUser,
  LegalUser,
  CreateNaturalUserInput,
  CreateLegalUserInput,

  // Payments
  Wallet,
  Payin,
  Payout,
  Transfer,

  // Cards
  Card,
  CardRegistration,
  Preauthorization,

  // KYC
  KycDocument,
  UboDeclaration,

  // Subscriptions
  RecurringSubscription,
} from '@globodai/fam-sdk';
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Lint & format
npm run lint
npm run format

# Type check
npm run typecheck

# Generate documentation
npm run docs
```

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit using [Conventional Commits](https://conventionalcommits.org) (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Security

If you discover a security vulnerability, please send an email to security@globodai.com instead of using the issue tracker.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with care by the <a href="https://globodai.com">Globodai</a> team
</p>
