/**
 * SCA Recipients types for the SDK
 */

import type { Currency } from './common.js'

/**
 * Recipient status
 */
export type RecipientStatus = 'PENDING' | 'ACTIVE' | 'CANCELLED'

/**
 * Payout method type
 */
export type PayoutMethodType = 'INTERNATIONAL_BANK_TRANSFER' | 'LOCAL_BANK_TRANSFER'

/**
 * Recipient entity
 */
export interface Recipient {
  Id: string
  Tag?: string
  CreationDate: number
  Status: RecipientStatus
  DisplayName: string
  PayoutMethodType: PayoutMethodType
  RecipientType: 'INDIVIDUAL' | 'BUSINESS'
  Currency: Currency
  Country: string
  UserId: string
  PendingUserAction?: {
    RedirectUrl: string
  }
  IndividualRecipient?: {
    FirstName: string
    LastName: string
  }
  BusinessRecipient?: {
    BusinessName: string
  }
  LocalBankTransfer?: {
    AccountNumber: string
    SortCode?: string
    ABA?: string
    BankName?: string
  }
  InternationalBankTransfer?: {
    IBAN?: string
    BIC?: string
    AccountNumber?: string
  }
}

/**
 * Create recipient request
 */
export interface CreateRecipientRequest {
  Tag?: string
  DisplayName: string
  PayoutMethodType: PayoutMethodType
  RecipientType: 'INDIVIDUAL' | 'BUSINESS'
  Currency: Currency
  IndividualRecipient?: {
    FirstName: string
    LastName: string
  }
  BusinessRecipient?: {
    BusinessName: string
  }
  LocalBankTransfer?: {
    AccountNumber: string
    SortCode?: string
    ABA?: string
    BankName?: string
  }
  InternationalBankTransfer?: {
    IBAN?: string
    BIC?: string
    AccountNumber?: string
  }
}

/**
 * Recipient schema request
 */
export interface RecipientSchemaRequest {
  PayoutMethodType: PayoutMethodType
  RecipientType: 'INDIVIDUAL' | 'BUSINESS'
  Currency: Currency
  Country?: string
}

/**
 * Recipient schema response
 */
export interface RecipientSchema {
  DisplayName: {
    Required: boolean
    MaxLength: number
  }
  RecipientType: {
    AllowedValues: string[]
  }
  IndividualRecipient?: {
    FirstName: { Required: boolean; MaxLength: number }
    LastName: { Required: boolean; MaxLength: number }
  }
  BusinessRecipient?: {
    BusinessName: { Required: boolean; MaxLength: number }
  }
  LocalBankTransfer?: Record<string, { Required: boolean; MaxLength?: number; Pattern?: string }>
  InternationalBankTransfer?: Record<
    string,
    { Required: boolean; MaxLength?: number; Pattern?: string }
  >
}
