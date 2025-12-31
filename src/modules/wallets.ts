/**
 * Wallets module
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { PaginatedResponse, PaginationParams } from '../types/common.js'
import type { CreateWalletRequest, UpdateWalletRequest, Wallet } from '../types/wallets.js'

/**
 * Wallet transaction item
 */
interface WalletTransaction {
  Id: string
  Tag?: string
  CreationDate: number
  AuthorId: string
  Type: string
  Nature: string
  Status: string
  DebitedFunds: { Amount: number; Currency: string }
  CreditedFunds: { Amount: number; Currency: string }
  Fees: { Amount: number; Currency: string }
  DebitedWalletId?: string
  CreditedWalletId?: string
}

/**
 * Wallets API module
 */
export class WalletsModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/mangopay/wallets')
  }

  /**
   * Create a wallet
   */
  async create(data: CreateWalletRequest): Promise<Wallet> {
    return this.post<Wallet>('', data)
  }

  /**
   * Get a wallet by ID
   */
  async getWallet(walletId: string): Promise<Wallet> {
    return this.client.get<Wallet>(this.path(walletId))
  }

  /**
   * Update a wallet
   */
  async update(walletId: string, data: UpdateWalletRequest): Promise<Wallet> {
    return this.put<Wallet>(walletId, data)
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(
    walletId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<WalletTransaction>> {
    return this.client.get<PaginatedResponse<WalletTransaction>>(
      this.path([walletId, 'transactions']),
      { params: params as Record<string, string | number | boolean | undefined | null> }
    )
  }
}
