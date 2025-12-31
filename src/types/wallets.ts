/**
 * Wallet types for the SDK
 */

import type { Currency, Money } from './common.js'

/**
 * Wallet status
 */
export type WalletStatus = 'CREATED' | 'CLOSED'

/**
 * Wallet entity
 */
export interface Wallet {
  Id: string
  Tag?: string
  CreationDate: number
  Owners: string[]
  Description: string
  Balance: Money
  Currency: Currency
  FundsType: 'DEFAULT' | 'FEES' | 'CREDIT'
}

/**
 * Create wallet request
 */
export interface CreateWalletRequest {
  Tag?: string
  Owners: string[]
  Description: string
  Currency: Currency
}

/**
 * Update wallet request
 */
export interface UpdateWalletRequest {
  Tag?: string
  Description?: string
}
