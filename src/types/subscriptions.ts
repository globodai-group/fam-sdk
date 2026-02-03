/**
 * Subscription types for the SDK (FAM custom implementation)
 */

import type { Currency, PaginationParams } from './common.js'

/**
 * Subscription status
 * AUTHENTICATION_NEEDED: User must complete 3D Secure (SCA) authentication
 */
export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'CANCELLED'
  | 'ENDED'
  | 'FAILED'
  | 'AUTHENTICATION_NEEDED'

/**
 * Subscription frequency
 */
export type SubscriptionFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

/**
 * Payment status
 */
export type SubscriptionPaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED'

/**
 * Recurring subscription entity
 */
export interface RecurringSubscription {
  id: string
  userId: string
  mangopayUserId: string
  walletId: string
  cardId?: string
  recurringPayinRegistrationId?: string
  status: SubscriptionStatus
  amount: number
  currency: Currency
  frequency: SubscriptionFrequency
  nextPaymentDate?: string
  lastPaymentDate?: string
  startDate: string
  endDate?: string
  processingEnabled: boolean
  webhookNotificationEnabled: boolean
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string

  /** Bundle ID if this subscription belongs to a bundle */
  bundleId?: string | null
}

/**
 * Subscription payment entity (matches FAM API response)
 */
export interface SubscriptionPayment {
  id: string
  payinId?: string
  type: 'CIT' | 'MIT'
  status: SubscriptionPaymentStatus
  amount: number
  fees?: number
  currency: Currency
  resultCode?: string
  resultMessage?: string
  processedAt?: string
  createdAt: string
}

/**
 * Subscription with payments (matches FAM API response for GET /subscriptions/:id)
 */
export interface SubscriptionWithPayments {
  id: string
  registrationId: string
  externalUserId: string
  externalSubscriptionId?: string
  subscriptionName?: string
  subscriptionType?: string
  billingPeriod?: string
  status: string
  amount: number
  currency: Currency
  frequency: SubscriptionFrequency
  payinsLinked?: number
  freeCycles?: number
  isInFreeCycle?: boolean
  processingEnabled: boolean
  nextProcessingAt?: string
  lastSyncedAt?: string
  metadata?: Record<string, unknown>
  mangopayData?: Record<string, unknown>
  payments: SubscriptionPayment[]
  createdAt: string
  updatedAt: string

  /** Bundle ID if this subscription belongs to a bundle */
  bundleId?: string | null
}

/**
 * Register subscription request
 */
export interface RegisterSubscriptionRequest {
  userId: string
  mangopayUserId: string
  walletId: string
  cardId: string
  amount: number
  currency: Currency
  frequency: SubscriptionFrequency
  startDate?: string
  endDate?: string
  metadata?: Record<string, unknown>
  webhookNotificationEnabled?: boolean
  /**
   * Override the next processing date for the first MIT payment.
   * Use this to defer the first recurring payment (e.g., when user has an existing yearly subscription
   * and wants to add monthly - defer monthly until yearly expires).
   * Format: ISO 8601 date string
   */
  nextProcessingAt?: string
}

/**
 * Update subscription request
 */
export interface UpdateSubscriptionRequest {
  amount?: number
  cardId?: string
  endDate?: string
  processingEnabled?: boolean
  webhookNotificationEnabled?: boolean
  metadata?: Record<string, unknown>
  /** Subscription name (displayed in portal) */
  subscriptionName?: string
  /** Subscription type (e.g., 'mbc', 'elearning') */
  subscriptionType?: string
  /** Billing period ('monthly' | 'yearly') */
  billingPeriod?: string
  /** Bundle ID - set to null to detach from bundle */
  bundleId?: string | null
}

/**
 * Subscription list filters
 */
export interface SubscriptionListFilters extends PaginationParams {
  userId?: string
  status?: SubscriptionStatus
  frequency?: SubscriptionFrequency
}

/**
 * Filters for listing subscriptions by MangoPay user ID
 */
export interface MangopayUserSubscriptionFilters {
  subscriptionType?: string
  activeOnly?: boolean
}

/**
 * Subscription returned by the byMangopayUser endpoint
 */
export interface MangopayUserSubscription {
  id: string
  registrationId: string
  mangopayUserId: string
  externalUserId: string
  externalSubscriptionId: string
  subscriptionName: string | null
  subscriptionType: string | null
  billingPeriod: string | null
  status: string
  amount: number
  currency: Currency
  frequency: SubscriptionFrequency
  processingEnabled: boolean
  nextProcessingAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string

  /** Bundle ID if this subscription belongs to a bundle */
  bundleId?: string | null
}

/**
 * Sync subscription response
 */
export interface SyncSubscriptionResponse {
  subscription: RecurringSubscription
  synced: boolean
  mangopayStatus?: string
}

/**
 * Linked product in a subscription
 */
export interface LinkedProduct {
  productId: string
  productName: string
  externalId: string | null
  expectedAmount: number
  isNew: boolean
}

/**
 * Link products request
 * Supports direct product IDs (preferred) or lookup by type
 */
export interface LinkProductsRequest {
  /** FAM product IDs - preferred method */
  productIds?: string[]
  /** Single FAM product ID */
  productId?: string
  /** Fallback: single product type for lookup */
  productType?: string
  /** Fallback: multiple product types for lookup */
  productTypes?: string[]
  /** If true, removes existing links before adding new ones */
  clearExisting?: boolean
}

/**
 * Link products response
 */
export interface LinkProductsResponse {
  success: boolean
  subscriptionId: string
  linkedProducts: LinkedProduct[]
  notFoundIds?: string[]
  notFoundTypes?: string[]
}
