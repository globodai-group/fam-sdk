/**
 * fam-sdk
 *
 * Official TypeScript SDK for the FAM API (Mangopay wrapper)
 */

// Main client
export { Fam } from './fam.js'

// HTTP Client and options
export type { FamOptions, RequestOptions } from './client.js'

// Error classes
export {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  FamError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ValidationError,
  WebhookSignatureError,
} from './errors/index.js'

// Utility functions
export {
  buildUrl,
  formatAmount,
  isBrowser,
  isNode,
  parseAmount,
  retry,
  sleep,
} from './utils/index.js'

// All types
export type * from './types/index.js'

// Modules (for advanced usage)
export {
  BankAccountsModule,
  BaseModule,
  CardRegistrationsModule,
  CardsModule,
  KycModule,
  PayinsModule,
  PayoutsModule,
  PortalModule,
  PreauthorizationsModule,
  ProductsModule,
  PromotionsModule,
  ScaRecipientsModule,
  SubscriptionsModule,
  TransfersModule,
  UboModule,
  UsersModule,
  WalletsModule,
} from './modules/index.js'
