/**
 * Payout types for the SDK
 */

import type { Money, TransactionNature, TransactionStatus } from './common.js'

/**
 * Payout mode
 */
export type PayoutMode = 'STANDARD' | 'INSTANT_PAYMENT' | 'INSTANT_PAYMENT_ONLY'

/**
 * Payout entity
 */
export interface Payout {
  Id: string
  Tag?: string
  CreationDate: number
  AuthorId: string
  CreditedUserId?: string
  DebitedFunds: Money
  CreditedFunds: Money
  Fees: Money
  Status: TransactionStatus
  ResultCode?: string
  ResultMessage?: string
  ExecutionDate?: number
  Type: 'PAYOUT'
  Nature: TransactionNature
  PaymentType: 'BANK_WIRE'
  BankAccountId: string
  DebitedWalletId: string
  BankWireRef?: string
  PayoutModeRequested?: PayoutMode
  PayoutModeApplied?: PayoutMode
  FallbackReason?: string
  ModeRequested?: PayoutMode
  ModeApplied?: PayoutMode
}

/**
 * Create payout request
 */
export interface CreatePayoutRequest {
  Tag?: string
  AuthorId: string
  DebitedFunds: Money
  Fees: Money
  DebitedWalletId: string
  BankAccountId: string
  BankWireRef?: string
  PayoutModeRequested?: PayoutMode
}
