<p align="center">
  <img src="https://img.shields.io/badge/FAM-SDK-0066FF?style=for-the-badge&logoColor=white" alt="FAM SDK" height="40">
</p>

<h1 align="center">FAM SDK</h1>

<p align="center">
  <strong>Official TypeScript SDK for the FAM API</strong><br>
  <em>A type-safe, developer-friendly wrapper for Mangopay payment services</em>
</p>

<p align="center">
  <a href="https://github.com/globodai-group/fam-sdk/actions/workflows/ci.yml"><img src="https://github.com/globodai-group/fam-sdk/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/globodai-fam-sdk"><img src="https://img.shields.io/npm/v/globodai-fam-sdk.svg?color=0066FF&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/globodai-fam-sdk"><img src="https://img.shields.io/npm/dm/globodai-fam-sdk.svg?color=green&label=downloads" alt="npm downloads"></a>
  <a href="https://bundlephobia.com/package/globodai-fam-sdk"><img src="https://img.shields.io/bundlephobia/minzip/globodai-fam-sdk?label=size&color=orange" alt="bundle size"></a>
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
npm install globodai-fam-sdk
```

<details>
<summary>Using other package managers</summary>

```bash
# yarn
yarn add globodai-fam-sdk

# pnpm
pnpm add globodai-fam-sdk
```

</details>

## Quick Start

```typescript
import { Fam } from 'globodai-fam-sdk';

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
import { Fam } from 'globodai-fam-sdk';
import type { FamOptions } from 'globodai-fam-sdk';

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

### Products

Products are stable entities (like Stripe products) that maintain permanent IDs between FAM and client applications.

<details open>
<summary><strong>CRUD Operations</strong></summary>

```typescript
// Create a product
const product = await fam.products.create({
  name: 'Premium Plan',
  monthlyPrice: 2900,  // in cents (29.00€)
  yearlyPrice: 29000,  // in cents (290.00€)
  currency: 'EUR',
  isActive: true,
  metadata: { tier: 'premium' },
});

// Get products
const products = await fam.products.list({ isActive: true, environment: 'production' });
const product = await fam.products.getById(productId);
const product = await fam.products.getByExternalId('external-id');
const product = await fam.products.getByName('Premium Plan');

// Find (returns null instead of throwing)
const product = await fam.products.findByExternalId('external-id');
const product = await fam.products.findByName('Premium Plan');

// Update a product
await fam.products.update(productId, { monthlyPrice: 3900 });

// Delete a product
await fam.products.remove(productId);
```

</details>

<details>
<summary><strong>Upsert Operations</strong></summary>

```typescript
// Upsert by external ID (create or update)
const result = await fam.products.upsertByExternalId('subscription_price_123', {
  name: 'Premium Plan',
  monthlyPrice: 2900,
  yearlyPrice: 29000,
});

if (result._created) {
  console.log('Product created:', result.id);
} else {
  console.log('Product updated:', result.id);
}

// Upsert by name (useful when external ID not available)
const result = await fam.products.upsertByName('Premium Plan', {
  monthlyPrice: 2900,
  yearlyPrice: 29000,
  externalId: 'optional-external-id',  // optional
});

// Activate/Deactivate
await fam.products.activate(productId);
await fam.products.deactivate(productId);
```

</details>

> **Note**: The `environment` field (sandbox/production) is automatically determined by your API token. You cannot set it manually.

### Bundles

Bundles group multiple subscriptions into a single payment with optional discounts.

<details open>
<summary><strong>Bundle Operations</strong></summary>

```typescript
// List bundles
const bundles = await fam.bundles.list({ isActive: true });
const userBundles = await fam.bundles.listByMangopayUser(mangopayUserId);

// Get bundle details (includes subscriptions)
const bundle = await fam.bundles.getBundle(bundleId);
const bundle = await fam.bundles.getByCode('mbc_ibo_global');

// Validate if bundle can be created
const validation = await fam.bundles.validate(
  ['subscription_1', 'subscription_2'],
  mangopayUserId
);

if (validation.valid) {
  console.log('Bundle can be created');
} else {
  console.log('Issues:', validation.errors);
}

// Get price information with proration
const price = await fam.bundles.getPrice(
  ['subscription_1', 'subscription_2'],
  { billingPeriod: 'monthly' }
);
console.log(`Bundle price: ${price.amount / 100}€`);
console.log(`Proration credit: ${price.prorationCredit / 100}€`);
```

</details>

<details>
<summary><strong>Create Bundles</strong></summary>

```typescript
// Create bundle from existing subscriptions
const { bundle, prorationCredit } = await fam.bundles.createFromSubscriptions({
  name: 'Pack Complet',
  subscriptionIds: ['sub_1', 'sub_2', 'sub_3'],
  amount: 15000,  // 150€
  billingPeriod: 'monthly',
  metadata: { discount: '20%' },
});

// Create bundle with new subscriptions (for new users)
const result = await fam.bundles.subscribe({
  name: 'Pack MBC + IBO',
  items: [
    { productType: 'mbc', amount: 2900 },
    { productType: 'ibo', amount: 1500 },
  ],
  amount: 3500,  // Discounted total
  billingPeriod: 'monthly',
  mangopayUserId: userId,
  cardId: cardId,
  walletId: walletId,
  externalUserId: 'user_123',
});
```

</details>

<details>
<summary><strong>Manage Bundles</strong></summary>

```typescript
// Update bundle
await fam.bundles.update(bundleId, {
  name: 'Pack Premium',
  amount: 12000,
  metadata: { tier: 'gold' },
});

// Add subscriptions to bundle
await fam.bundles.addSubscriptions(bundleId, ['sub_4'], 18000);

// Remove subscriptions from bundle
await fam.bundles.removeSubscriptions(bundleId, ['sub_2'], 10000);

// Activate/Deactivate
await fam.bundles.activate(bundleId);
await fam.bundles.deactivate(bundleId);

// Dissolve bundle (re-enables individual subscriptions)
const result = await fam.bundles.dissolve(bundleId);
console.log('Re-enabled subscriptions:', result.reenabledSubscriptionIds);
```

</details>

### Portal

The Portal module provides methods to create sessions for the FAM Payment Portal, where users can manage their subscriptions, cards, and invoices.

<details open>
<summary><strong>Simple Portal Redirect (No Checkout)</strong></summary>

Redirect users to the portal to manage their existing subscriptions, cards, and invoices without initiating a new checkout.

```typescript
// Create a portal session without checkout
const session = await fam.portal.createSession({
  mangopayUserId: 'user_m_01HXK...',
  returnUrl: 'https://myapp.com/dashboard',
  expiresInMinutes: 60,  // optional, default 60
});

// Redirect user to portal
window.location.href = session.data.url;
// User sees: subscription list, cards, invoices, etc.
```

</details>

<details>
<summary><strong>Checkout Without Discount</strong></summary>

Create a checkout session for a new subscription at full price.

```typescript
// Basic checkout - monthly subscription at full price
const session = await fam.portal.createSession({
  mangopayUserId: 'user_m_01HXK...',
  returnUrl: 'https://myapp.com/success',
  checkoutConfig: {
    productType: 'subscription',
    productLabel: 'Premium Plan',
    productDescription: 'Access to all premium features',
    amount: 2900,  // 29.00€ in cents
    currency: 'EUR',
    isRecurring: true,
    frequency: 'MONTHLY',  // Locks to monthly (no selector)
    creditedWalletId: 'wallet_123',
    creditedUserId: 'user_456',  // optional, for fees
    externalUserId: 'your-app-user-id',
    externalSubscriptionId: 'your-sub-id',  // optional
    metadata: { plan: 'premium', source: 'upgrade' },
  },
});

// User sees: "Premium Plan - 29.00€/month"
```

</details>

<details>
<summary><strong>Checkout With Frequency Selector</strong></summary>

Let users choose between monthly and yearly billing.

```typescript
// Checkout with frequency choice (monthly/yearly)
const session = await fam.portal.createSession({
  mangopayUserId: 'user_m_01HXK...',
  returnUrl: 'https://myapp.com/success',
  checkoutConfig: {
    productType: 'subscription',
    productLabel: 'Premium Plan',
    amount: 2900,           // 29.00€/month
    yearlyAmount: 29000,    // 290.00€/year (annual price)
    yearlySavingsLabel: '2 mois offerts',  // or "-17%"
    isRecurring: true,
    // frequency NOT set = shows selector
    creditedWalletId: 'wallet_123',
    externalUserId: 'your-app-user-id',
  },
});

// User sees: Toggle between "29.00€/month" and "290.00€/year (2 mois offerts)"
```

</details>

<details>
<summary><strong>Checkout With Discount</strong></summary>

Apply a promotional discount to the checkout.

```typescript
// Checkout with discount applied
const session = await fam.portal.createSession({
  mangopayUserId: 'user_m_01HXK...',
  returnUrl: 'https://myapp.com/success',
  checkoutConfig: {
    productType: 'subscription',
    productLabel: 'Premium Plan',
    amount: 1900,            // Discounted price: 19.00€
    originalAmount: 2900,    // Original price: 29.00€ (strikethrough)
    hasDiscount: true,
    discountLabel: '-35% Black Friday',  // Shown as badge
    isRecurring: true,
    frequency: 'MONTHLY',
    creditedWalletId: 'wallet_123',
    externalUserId: 'your-app-user-id',
  },
});

// User sees: "~~29.00€~~ 19.00€/month" with "-35% Black Friday" badge
```

</details>

<details>
<summary><strong>Checkout With Free Trial</strong></summary>

Offer a free trial period before the first charge.

```typescript
// Checkout with 14-day free trial
const session = await fam.portal.createSession({
  mangopayUserId: 'user_m_01HXK...',
  returnUrl: 'https://myapp.com/success',
  checkoutConfig: {
    productType: 'subscription',
    productLabel: 'Premium Plan',
    amount: 2900,
    isRecurring: true,
    frequency: 'MONTHLY',
    trialDays: 14,  // First charge in 14 days
    creditedWalletId: 'wallet_123',
    externalUserId: 'your-app-user-id',
  },
});

// User sees: "Premium Plan - 29.00€/month after 14-day free trial"
// First MIT will be scheduled 14 days after card registration
```

</details>

<details>
<summary><strong>Checkout With Free Cycles</strong></summary>

Offer free billing cycles (useful for downgrades from yearly to monthly).

```typescript
// Checkout with 3 free months (e.g., downgrade from yearly)
const session = await fam.portal.createSession({
  mangopayUserId: 'user_m_01HXK...',
  returnUrl: 'https://myapp.com/success',
  checkoutConfig: {
    productType: 'subscription',
    productLabel: 'Premium Plan',
    amount: 2900,
    isRecurring: true,
    frequency: 'MONTHLY',
    freeCycles: 3,  // 3 months free, then charges start
    creditedWalletId: 'wallet_123',
    externalUserId: 'your-app-user-id',
  },
});

// User sees: "Premium Plan - 29.00€/month (3 mois offerts)"
// First 3 MIT payments will be 0€, then normal pricing
// Note: freeCycles takes precedence over trialDays if both set
```

</details>

<details>
<summary><strong>Checkout With Discount + Frequency Selector</strong></summary>

Combine discount with monthly/yearly choice.

```typescript
// Full featured checkout
const session = await fam.portal.createSession({
  mangopayUserId: 'user_m_01HXK...',
  returnUrl: 'https://myapp.com/success',
  checkoutConfig: {
    productType: 'subscription',
    productLabel: 'Premium Plan',
    productDescription: 'Unlock all premium features',
    // Discounted prices
    amount: 1900,               // Monthly: 19.00€
    originalAmount: 2900,       // Was: 29.00€
    yearlyAmount: 19000,        // Yearly: 190.00€
    hasDiscount: true,
    discountLabel: 'CODE: LAUNCH50',
    yearlySavingsLabel: '2 mois offerts',
    isRecurring: true,
    // No frequency = shows selector
    creditedWalletId: 'wallet_123',
    externalUserId: 'your-app-user-id',
    statementDescriptor: 'MYAPP-PREM',  // Bank statement (max 10 chars)
    tag: 'campaign:launch2024',
  },
});
```

</details>

<details>
<summary><strong>Filter Subscriptions by User</strong></summary>

When multiple app users share a MangoPay account, filter visible subscriptions.

```typescript
// Only show subscriptions for a specific external user
const session = await fam.portal.createSession({
  mangopayUserId: 'user_m_01HXK...',  // Shared MangoPay account
  returnUrl: 'https://myapp.com/dashboard',
  filterByExternalUserId: 'app-user-123',  // Only their subscriptions
});

// Portal only shows subscriptions where externalUserId matches
```

</details>

<details>
<summary><strong>Session Management</strong></summary>

```typescript
// Validate session (called by portal frontend)
const result = await fam.portal.validateSession({
  token: 'session-token-from-url',
});

if (result.valid) {
  const { user, website, checkoutConfig } = result.data;
  console.log(`Welcome ${user.firstName}`);

  if (checkoutConfig) {
    // Checkout flow
    console.log(`Checkout for: ${checkoutConfig.productLabel}`);
  } else {
    // Management flow
    console.log('Showing subscriptions and cards');
  }
}

// Get current portal user (requires session token header)
const user = await fam.portal.getUser('session-token');
console.log(`Hello ${user.data.firstName}`);

// Refresh session (extends by 60 minutes)
const refreshed = await fam.portal.refreshSession('session-token');
console.log(`Session extended until ${refreshed.data.expiresAt}`);

// Logout (invalidate session)
await fam.portal.logout('session-token');
```

</details>

<details>
<summary><strong>CheckoutConfig Reference</strong></summary>

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productType` | string | ✅ | Product identifier (e.g., 'subscription', 'course') |
| `productLabel` | string | ✅ | Display name |
| `productDescription` | string | ❌ | Optional description |
| `amount` | number | ✅ | Price in cents (monthly if selector shown) |
| `currency` | string | ❌ | Currency code (default: EUR) |
| `isRecurring` | boolean | ✅ | Recurring payment flag |
| `frequency` | 'MONTHLY' \| 'YEARLY' | ❌ | Lock frequency (omit to show selector) |
| `yearlyAmount` | number | ❌ | Yearly price in cents (for selector) |
| `yearlySavingsLabel` | string | ❌ | Savings badge (e.g., "2 mois offerts") |
| `hasDiscount` | boolean | ❌ | Discount applied flag |
| `discountLabel` | string | ❌ | Discount badge text |
| `originalAmount` | number | ❌ | Original price before discount (strikethrough) |
| `creditedWalletId` | string | ✅ | Merchant wallet to receive payment |
| `creditedUserId` | string | ❌ | Merchant user ID (for fees) |
| `externalUserId` | string | ✅ | User ID in your application |
| `externalSubscriptionId` | string | ❌ | Subscription ID in your application |
| `metadata` | object | ❌ | Custom metadata |
| `tag` | string | ❌ | MangoPay tag (max 255 chars) |
| `trialDays` | number | ❌ | Days before first charge |
| `freeCycles` | number | ❌ | Number of free billing cycles |
| `statementDescriptor` | string | ❌ | Bank statement text (max 10 chars) |

</details>

## Webhooks

Verify and process webhook events securely:

```typescript
import { Webhooks } from 'globodai-fam-sdk/webhooks';

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
} from 'globodai-fam-sdk';

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

  // Products
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  UpsertProductRequest,
  UpsertProductResponse,
  ProductListFilters,

  // Bundles
  Bundle,
  BundleWithSubscriptions,
  CreateBundleFromSubscriptionsRequest,
  CreateBundleWithNewSubscriptionsRequest,
  BundleValidationResult,
  BundlePriceInfo,

  // Portal
  CheckoutConfig,
  PortalUser,
  PortalWebsiteConfig,
  CreatePortalSessionRequest,
  CreatePortalSessionResponse,
  ValidatePortalSessionRequest,
  ValidatePortalSessionResponse,
  GetPortalUserResponse,
  RefreshPortalSessionResponse,
  PortalLogoutResponse,
} from 'globodai-fam-sdk';
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
