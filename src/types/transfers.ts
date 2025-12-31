/**
 * Transfer types for the SDK
 */

import type { Money, TransactionNature, TransactionStatus } from './common.js'

/**
 * Transfer entity
 */
export interface Transfer {
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
  Type: 'TRANSFER'
  Nature: TransactionNature
  DebitedWalletId: string
  CreditedWalletId: string
}

/**
 * Create transfer request
 */
export interface CreateTransferRequest {
  Tag?: string
  AuthorId: string
  CreditedUserId?: string
  DebitedFunds: Money
  Fees: Money
  DebitedWalletId: string
  CreditedWalletId: string
}

/**
 * Create SCA transfer request
 */
export interface CreateScaTransferRequest {
  Tag?: string
  AuthorId: string
  CreditedUserId?: string
  DebitedFunds: Money
  Fees: Money
  DebitedWalletId: string
  CreditedWalletId: string
  StatementDescriptor?: string
}

/**
 * Create transfer refund request
 */
export interface CreateTransferRefundRequest {
  Tag?: string
  AuthorId: string
}
