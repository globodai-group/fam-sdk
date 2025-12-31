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
 * Subscription payment entity
 */
export interface SubscriptionPayment {
  id: string
  subscriptionId: string
  payinId?: string
  amount: number
  currency: Currency
  status: SubscriptionPaymentStatus
  scheduledDate: string
  processedAt?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

/**
 * Subscription with payments
 */
export interface SubscriptionWithPayments extends RecurringSubscription {
  payments: SubscriptionPayment[]
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
 * Sync subscription response
 */
export interface SyncSubscriptionResponse {
  subscription: RecurringSubscription
  synced: boolean
  mangopayStatus?: string
}
