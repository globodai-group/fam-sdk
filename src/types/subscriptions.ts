/**
 * Subscription types for the SDK (FAM custom implementation)
 */

import type { Currency, PaginationParams } from './common.js'

/**
 * Subscription status
 */
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'ENDED' | 'FAILED'

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
}

/**
 * Sync subscription response
 */
export interface SyncSubscriptionResponse {
  subscription: RecurringSubscription
  synced: boolean
  mangopayStatus?: string
}
