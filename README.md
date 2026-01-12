# fam-sdk

<p align="center">
  <strong>Official TypeScript SDK for the FAM API (Mangopay wrapper)</strong>
</p>

<p align="center">
  <a href="https://github.com/globodai-group/fam-sdk/actions/workflows/ci.yml"><img src="https://github.com/globodai-group/fam-sdk/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/fam-sdk"><img src="https://img.shields.io/npm/v/fam-sdk.svg?color=blue&label=version" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/fam-sdk"><img src="https://img.shields.io/npm/dm/fam-sdk.svg?color=green" alt="npm downloads"></a>
  <a href="https://bundlephobia.com/package/fam-sdk"><img src="https://img.shields.io/bundlephobia/minzip/fam-sdk?label=bundle%20size" alt="bundle size"></a>
</p>

<p align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://pnpm.io"><img src="https://img.shields.io/badge/pnpm-%3E%3D9.0-F69220?logo=pnpm&logoColor=white" alt="pnpm"></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="#"><img src="https://img.shields.io/badge/ESM%20%7C%20CJS-supported-8A2BE2" alt="ESM | CJS"></a>
  <a href="#"><img src="https://img.shields.io/badge/dependencies-0-success" alt="Zero Dependencies"></a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-fe5196?logo=conventionalcommits&logoColor=white" alt="Conventional Commits"></a>
  <a href="https://prettier.io/"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="Code Style: Prettier"></a>
  <a href="https://github.com/globodai-group/fam-sdk/issues"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

---

## Features

- Full TypeScript support with strict mode
- ESM and CommonJS builds
- Automatic retry with exponential backoff
- Comprehensive error handling
- Webhook signature verification
- All Mangopay endpoints + FAM custom subscriptions

## Installation

```bash
# npm
npm install fam-sdk

# pnpm
pnpm add fam-sdk

# yarn
yarn add fam-sdk
```

## Quick Start

```typescript
import { Fam } from 'fam-sdk'

const client = new Fam({
  baseUrl: 'https://api.fam.com',
  token: 'your-auth-token',
})

// Create a natural user
const user = await client.users.createNatural({
  Email: 'user@example.com',
  FirstName: 'John',
  LastName: 'Doe',
  Birthday: 631152000,
  Nationality: 'FR',
  CountryOfResidence: 'FR',
})

// Create a wallet
const wallet = await client.wallets.create({
  Owners: [user.Id],
  Description: 'Main wallet',
  Currency: 'EUR',
})
```

## Configuration

```typescript
import { Fam } from 'fam-sdk'
import type { FamOptions } from 'fam-sdk'

const options: FamOptions = {
  baseUrl: 'https://api.fam.com',
  token: 'your-auth-token',
  timeout: 30000, // Request timeout in ms (default: 30000)
  retries: 3,     // Number of retries on network errors (default: 3)
}

const client = new Fam(options)
```

## API Reference

### Users

```typescript
// Natural Users
const user = await client.users.createNatural({ ... })
const user = await client.users.updateNatural(userId, { ... })
const user = await client.users.getUser(userId)
const user = await client.users.getNaturalUser(userId)

// Legal Users
const user = await client.users.createLegal({ ... })
const user = await client.users.updateLegal(userId, { ... })
const user = await client.users.getLegalUser(userId)

// User resources
const wallets = await client.users.getWallets(userId)
const cards = await client.users.getCards(userId)
const bankAccounts = await client.users.getBankAccounts(userId)
const transactions = await client.users.getTransactions(userId)
```

### Wallets

```typescript
const wallet = await client.wallets.create({ ... })
const wallet = await client.wallets.getWallet(walletId)
const transactions = await client.wallets.getTransactions(walletId)
```

### Payins

```typescript
// Card Direct Payin
const payin = await client.payins.create({ ... })
const payin = await client.payins.getPayin(payinId)
const refund = await client.payins.refund(payinId, { ... })

// Recurring Payments
const recurring = await client.payins.createRecurringPayment({ ... })
const recurring = await client.payins.viewRecurringPayment(registrationId)
const payin = await client.payins.createRecurringCit({ ... })
const payin = await client.payins.createRecurringMit({ ... })
```

### Payouts

```typescript
const payout = await client.payouts.create({ ... })
const payout = await client.payouts.getPayout(payoutId)
```

### Transfers

```typescript
const transfer = await client.transfers.create({ ... })
const transfer = await client.transfers.getTransfer(transferId)
const transfer = await client.transfers.createSca({ ... })
const refund = await client.transfers.refund(transferId, { ... })
```

### Cards

```typescript
// Card Registrations
const registration = await client.cardRegistrations.create({ ... })
const registration = await client.cardRegistrations.getRegistration(registrationId)
const registration = await client.cardRegistrations.update(registrationId, { ... })

// Cards
const card = await client.cards.getCard(cardId)
const card = await client.cards.deactivate(cardId)
const preauths = await client.cards.getPreauthorizations(cardId)

// Preauthorizations
const preauth = await client.preauthorizations.create({ ... })
const preauth = await client.preauthorizations.cancel(preauthId)
```

### User-scoped Modules

```typescript
// Bank Accounts
const bankAccounts = client.bankAccounts(userId)
const iban = await bankAccounts.createIban({ ... })
const account = await bankAccounts.getAccount(accountId)
const accounts = await bankAccounts.list()
await bankAccounts.deactivate(accountId)

// KYC Documents
const kyc = client.kyc(userId)
const document = await kyc.create({ Type: 'IDENTITY_PROOF' })
await kyc.createPage(documentId, fileBase64)
await kyc.submit(documentId)

// UBO Declarations
const ubo = client.ubo(userId)
const declaration = await ubo.createDeclaration()
const uboEntry = await ubo.createUbo(declarationId, { ... })
await ubo.submit(declarationId)

// SCA Recipients
const recipients = client.scaRecipients(userId)
const recipient = await recipients.create({ ... })
const schema = await recipients.getSchema({ ... })
```

### Subscriptions (FAM Custom)

```typescript
const subscription = await client.subscriptions.register({ ... })
const subscription = await client.subscriptions.getSubscription(subscriptionId)
const subscriptions = await client.subscriptions.list({ ... })
const subscription = await client.subscriptions.cancel(subscriptionId)
const subscription = await client.subscriptions.enable(subscriptionId)
const subscription = await client.subscriptions.disable(subscriptionId)
```

## Webhooks

```typescript
import { Webhooks } from 'fam-sdk/webhooks'

const webhooks = new Webhooks({
  signingSecret: 'your-webhook-signing-secret',
})

// In your webhook endpoint
app.post('/webhooks', async (req, res) => {
  const signature = req.headers['x-webhook-signature']
  const event = webhooks.constructEvent(JSON.stringify(req.body), signature)

  switch (event.EventType) {
    case 'PAYIN_NORMAL_SUCCEEDED':
      // Handle successful payin
      break
    case 'KYC_SUCCEEDED':
      // Handle KYC validation
      break
    case 'FAM_SUBSCRIPTION_PAYMENT_SUCCEEDED':
      // Handle subscription payment
      break
  }

  res.status(200).send('OK')
})
```

## Error Handling

```typescript
import {
  ApiError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
} from 'fam-sdk'

try {
  const user = await client.users.getUser('invalid-id')
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('User not found')
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid or expired token')
  } else if (error instanceof ValidationError) {
    console.log('Validation errors:', error.errors)
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter}s`)
  } else if (error instanceof NetworkError) {
    console.log('Network error:', error.originalError)
  } else if (error instanceof ApiError) {
    console.log(`API error ${error.statusCode}: ${error.message}`)
  }
}
```

## TypeScript

Full type definitions are included:

```typescript
import type {
  NaturalUser,
  LegalUser,
  Wallet,
  Payin,
  Payout,
  Transfer,
  Card,
  KycDocument,
  RecurringSubscription,
} from 'fam-sdk'
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Run tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Lint
pnpm run lint

# Format
pnpm run format

# Type check
pnpm run typecheck

# Generate documentation
pnpm run docs
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow the existing code style.

## License

MIT
