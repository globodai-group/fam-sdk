/**
 * Card types for the SDK
 */

import type { Currency, Money, SecureMode } from './common.js'
import type { BrowserInfo } from './payins.js'

/**
 * Card type
 */
export type CardType =
  | 'CB_VISA_MASTERCARD'
  | 'DINERS'
  | 'MASTERPASS'
  | 'MAESTRO'
  | 'P24'
  | 'IDEAL'
  | 'BCMC'
  | 'PAYLIB'

/**
 * Card status
 */
export type CardValidity = 'UNKNOWN' | 'VALID' | 'INVALID'

/**
 * Card registration status
 */
export type CardRegistrationStatus = 'CREATED' | 'VALIDATED' | 'ERROR'

/**
 * Card registration entity
 */
export interface CardRegistration {
  Id: string
  Tag?: string
  CreationDate: number
  UserId: string
  Currency: Currency
  CardType: CardType
  CardId?: string
  CardRegistrationURL: string
  AccessKey: string
  PreregistrationData: string
  RegistrationData?: string
  ResultCode?: string
  ResultMessage?: string
  Status: CardRegistrationStatus
}

/**
 * Card entity
 */
export interface Card {
  Id: string
  Tag?: string
  CreationDate: number
  UserId: string
  ExpirationDate: string
  Alias: string
  CardProvider: string
  CardType: CardType
  Country: string
  Product?: string
  BankCode?: string
  Active: boolean
  Currency: Currency
  Validity: CardValidity
  Fingerprint: string
}

/**
 * Create card registration request
 */
export interface CreateCardRegistrationRequest {
  Tag?: string
  UserId: string
  Currency: Currency
  CardType?: CardType
}

/**
 * Update card registration request
 */
export interface UpdateCardRegistrationRequest {
  Tag?: string
  RegistrationData: string
}

/**
 * Update card request
 */
export interface UpdateCardRequest {
  Active: boolean
}

/**
 * Preauthorization status
 */
export type PreauthorizationStatus = 'CREATED' | 'SUCCEEDED' | 'FAILED'

/**
 * Payment status
 */
export type PaymentStatus = 'WAITING' | 'CANCELED' | 'EXPIRED' | 'VALIDATED'

/**
 * Preauthorization entity
 */
export interface Preauthorization {
  Id: string
  Tag?: string
  CreationDate: number
  AuthorId: string
  DebitedFunds: Money
  RemainingFunds: Money
  Status: PreauthorizationStatus
  PaymentStatus: PaymentStatus
  ResultCode?: string
  ResultMessage?: string
  ExecutionType: 'DIRECT'
  SecureMode: SecureMode
  CardId: string
  SecureModeNeeded: boolean
  SecureModeRedirectURL?: string
  SecureModeReturnURL: string
  ExpirationDate: number
  PayInId?: string
  Billing?: {
    FirstName: string
    LastName: string
    Address: {
      AddressLine1: string
      AddressLine2?: string
      City: string
      Region?: string
      PostalCode: string
      Country: string
    }
  }
  Shipping?: {
    FirstName: string
    LastName: string
    Address: {
      AddressLine1: string
      AddressLine2?: string
      City: string
      Region?: string
      PostalCode: string
      Country: string
    }
  }
  Culture?: string
  StatementDescriptor?: string
  BrowserInfo?: BrowserInfo
  IpAddress?: string
  MultiCapture?: boolean
}

/**
 * Create preauthorization request
 */
export interface CreatePreauthorizationRequest {
  Tag?: string
  AuthorId: string
  DebitedFunds: Money
  CardId: string
  SecureMode?: SecureMode
  SecureModeReturnURL: string
  StatementDescriptor?: string
  Culture?: string
  IpAddress?: string
  BrowserInfo?: BrowserInfo
  Billing?: {
    FirstName: string
    LastName: string
    Address: {
      AddressLine1: string
      AddressLine2?: string
      City: string
      Region?: string
      PostalCode: string
      Country: string
    }
  }
  Shipping?: {
    FirstName: string
    LastName: string
    Address: {
      AddressLine1: string
      AddressLine2?: string
      City: string
      Region?: string
      PostalCode: string
      Country: string
    }
  }
}

/**
 * Update preauthorization request
 */
export interface UpdatePreauthorizationRequest {
  Tag?: string
  PaymentStatus: 'CANCELED'
}
