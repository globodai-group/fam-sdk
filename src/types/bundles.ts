/**
 * Bundle types for the SDK (FAM custom implementation)
 * Bundles group multiple RecurringSubscriptions into a single payment
 */

import type { Currency, PaginationParams } from './common.js'
import type { RecurringSubscription, SubscriptionWithPayments } from './subscriptions.js'

/**
 * Bundle billing period
 */
export type BundleBillingPeriod = 'monthly' | 'yearly'

/**
 * Bundle entity - groups multiple subscriptions
 */
export interface Bundle {
  id: string
  websiteId: string

  /** Optional code identifier (e.g., 'mbc_ibo_global') */
  code: string | null

  /** Display name */
  name: string

  /** Optional description */
  description: string | null

  /** Bundle price in cents */
  amount: number

  /** Currency (default: EUR) */
  currency: Currency

  /** Billing period */
  billingPeriod: BundleBillingPeriod

  /** ID of the primary subscription that holds the MangoPay RecurringPayinRegistration */
  primarySubscriptionId: string

  /** Whether the bundle is active */
  isActive: boolean

  /** Custom metadata */
  metadata: Record<string, unknown>

  createdAt: string
  updatedAt: string
}

/**
 * Bundle with its subscriptions loaded
 */
export interface BundleWithSubscriptions extends Bundle {
  /** Subscriptions included in this bundle */
  subscriptions: RecurringSubscription[]

  /** Primary subscription details */
  primarySubscription?: SubscriptionWithPayments
}

/**
 * Request to create a bundle from existing subscriptions
 */
export interface CreateBundleFromSubscriptionsRequest {
  /** Display name for the bundle */
  name: string

  /** Optional description */
  description?: string

  /** IDs of existing subscriptions to group */
  subscriptionIds: string[]

  /** Bundle price in cents (should be less than sum of individual prices) */
  amount: number

  /** Currency (default: EUR) */
  currency?: Currency

  /** Billing period */
  billingPeriod: BundleBillingPeriod

  /** Optional code identifier */
  code?: string

  /** Custom metadata */
  metadata?: Record<string, unknown>
}

/**
 * Item definition for creating a new bundle with new subscriptions
 */
export interface BundleItemDefinition {
  /** Product type (e.g., 'mbc', 'ibo', 'global') */
  productType: string

  /** Optional custom amount for this item (for display/tracking) */
  amount?: number
}

/**
 * Request to create a bundle with new subscriptions (for new users)
 */
export interface CreateBundleWithNewSubscriptionsRequest {
  /** Display name for the bundle */
  name: string

  /** Optional description */
  description?: string

  /** Items to include in the bundle */
  items: BundleItemDefinition[]

  /** Bundle price in cents */
  amount: number

  /** Currency (default: EUR) */
  currency?: Currency

  /** Billing period */
  billingPeriod: BundleBillingPeriod

  /** MangoPay user ID */
  mangopayUserId: string

  /** Card ID for payment */
  cardId: string

  /** Wallet ID to credit */
  walletId: string

  /** External user ID (in client app) */
  externalUserId: string

  /** Optional code identifier */
  code?: string

  /** Custom metadata */
  metadata?: Record<string, unknown>

  /** Enable webhook notifications */
  webhookNotificationEnabled?: boolean
}

/**
 * Request to update a bundle
 */
export interface UpdateBundleRequest {
  /** New name */
  name?: string

  /** New description */
  description?: string

  /** Subscription IDs to add to the bundle */
  addSubscriptionIds?: string[]

  /** Subscription IDs to remove from the bundle */
  removeSubscriptionIds?: string[]

  /** New bundle amount (if subscriptions changed) */
  amount?: number

  /** Update active status */
  isActive?: boolean

  /** Update metadata */
  metadata?: Record<string, unknown>
}

/**
 * Bundle list filters
 */
export interface BundleListFilters extends PaginationParams {
  /** Filter by MangoPay user ID */
  mangopayUserId?: string

  /** Filter by active status */
  isActive?: boolean

  /** Filter by code */
  code?: string
}

/**
 * Response when creating a bundle
 */
export interface CreateBundleResponse {
  bundle: BundleWithSubscriptions

  /** If 3DS is needed for the first payment */
  secureModeNeeded?: boolean

  /** 3DS redirect URL */
  secureModeRedirectUrl?: string

  /** First payment ID */
  payinId?: string
}

/**
 * Price information for a bundle
 */
export interface BundlePriceInfo {
  /** Bundle code */
  code: string

  /** Bundle name */
  name: string

  /** Original bundle price */
  originalPrice: number

  /** Final price after proration (if applicable) */
  finalPrice: number

  /** Proration credit applied */
  prorationCredit: number

  /** Individual items with their prices */
  items: {
    productType: string
    individualPrice: number
  }[]

  /** Total savings compared to individual purchases */
  savings: number

  /** Savings percentage */
  savingsPercent: number

  /** Currency */
  currency: Currency

  /** Billing period */
  billingPeriod: BundleBillingPeriod
}

/**
 * Validation result when checking if a bundle can be created
 */
export interface BundleValidationResult {
  /** Whether the bundle can be created */
  valid: boolean

  /** Validation errors if any */
  errors: BundleValidationError[]

  /** Subscriptions that need to be disabled (included in bundle) */
  subscriptionsToDisable: string[]

  /** Proration credit if user has existing subscriptions */
  prorationCredit?: number
}

/**
 * Bundle validation error
 */
export interface BundleValidationError {
  /** Error code */
  code: string

  /** Product type that has the issue */
  productType?: string

  /** Required product type (for dependency errors) */
  requiredProductType?: string

  /** Human-readable error message */
  message: string
}

/**
 * Response when dissolving a bundle
 */
export interface DissolveBundleResponse {
  /** Whether the dissolution was successful */
  success: boolean

  /** Subscriptions that were re-enabled */
  reenabledSubscriptions: RecurringSubscription[]

  /** Message */
  message: string
}
