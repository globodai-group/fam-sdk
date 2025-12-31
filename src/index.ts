/**
 * @freelance-and-me/sdk
 *
 * Official TypeScript SDK for the Freelance-and-Me API (Mangopay wrapper)
 */

// Main client
export { FreelanceAndMe } from './freelance-and-me.js'

// HTTP Client and options
export type { FreelanceAndMeOptions, RequestOptions } from './client.js'

// Error classes
export {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  FreelanceAndMeError,
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
  PreauthorizationsModule,
  ScaRecipientsModule,
  SubscriptionsModule,
  TransfersModule,
  UboModule,
  UsersModule,
  WalletsModule,
} from './modules/index.js'
