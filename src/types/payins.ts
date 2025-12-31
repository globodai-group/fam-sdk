/**
 * Payin types for the SDK
 */

import type {
  ExecutionType,
  Money,
  SecureMode,
  TransactionNature,
  TransactionStatus,
} from './common.js'

/**
 * Payin type
 */
export type PayinType = 'CARD' | 'PREAUTHORIZED' | 'BANK_WIRE' | 'DIRECT_DEBIT' | 'PAYPAL'

/**
 * Payin entity
 */
export interface Payin {
  Id: string
  Tag?: string
  CreationDate: number
  AuthorId: string
  CreditedUserId?: string
  CreditedWalletId: string
  DebitedFunds: Money
  CreditedFunds: Money
  Fees: Money
  Status: TransactionStatus
  ResultCode?: string
  ResultMessage?: string
  ExecutionDate?: number
  Type: PayinType
  Nature: TransactionNature
  PaymentType: string
  ExecutionType: ExecutionType
  SecureMode?: SecureMode
  CardId?: string
  SecureModeReturnURL?: string
  SecureModeRedirectURL?: string
  SecureModeNeeded?: boolean
  Culture?: string
  StatementDescriptor?: string
}

/**
 * Create card direct payin request
 */
export interface CreateCardDirectPayinRequest {
  Tag?: string
  AuthorId: string
  CreditedUserId?: string
  CreditedWalletId: string
  DebitedFunds: Money
  Fees: Money
  CardId: string
  SecureMode?: SecureMode
  SecureModeReturnURL: string
  StatementDescriptor?: string
  Culture?: string
  IpAddress?: string
  BrowserInfo?: BrowserInfo
}

/**
 * Browser info for 3DS
 */
export interface BrowserInfo {
  AcceptHeader: string
  JavaEnabled: boolean
  Language: string
  ColorDepth: number
  ScreenHeight: number
  ScreenWidth: number
  TimeZoneOffset: number
  UserAgent: string
  JavascriptEnabled: boolean
}

/**
 * Refund entity
 */
export interface Refund {
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
  Type: string
  Nature: TransactionNature
  InitialTransactionId: string
  InitialTransactionType: string
  DebitedWalletId: string
  CreditedWalletId?: string
  RefundReason?: RefundReason
}

/**
 * Refund reason
 */
export interface RefundReason {
  RefundReasonType: string
  RefundReasonMessage?: string
}

/**
 * Create refund request
 */
export interface CreateRefundRequest {
  Tag?: string
  AuthorId: string
  DebitedFunds?: Money
  Fees?: Money
}

/**
 * Recurring payment status
 */
export type RecurringPaymentStatus = 'CREATED' | 'AUTHENTICATION_NEEDED' | 'IN_PROGRESS' | 'ENDED'

/**
 * Recurring payment registration
 */
export interface RecurringPaymentRegistration {
  Id: string
  Tag?: string
  Status: RecurringPaymentStatus
  CurrentState: {
    PayinsLinked: number
    CumulatedDebitedAmount: Money
    CumulatedFeesAmount: Money
    LastPayinId?: string
  }
  RecurringType: 'CUSTOM'
  TotalAmount?: Money
  CycleNumber?: number
  AuthorId: string
  CardId: string
  CreditedUserId?: string
  CreditedWalletId: string
  Billing?: BillingAddress
  Shipping?: ShippingAddress
  EndDate?: number
  Frequency?: string
  FixedNextAmount?: boolean
  FractionedPayment?: boolean
  FreeCycles?: number
  FirstTransactionDebitedFunds?: Money
  FirstTransactionFees?: Money
  NextTransactionDebitedFunds?: Money
  NextTransactionFees?: Money
  Migration?: boolean
}

/**
 * Billing address
 */
export interface BillingAddress {
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

/**
 * Shipping address
 */
export interface ShippingAddress {
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

/**
 * Create recurring payment request
 */
export interface CreateRecurringPaymentRequest {
  Tag?: string
  AuthorId: string
  CardId: string
  CreditedUserId?: string
  CreditedWalletId: string
  FirstTransactionDebitedFunds: Money
  FirstTransactionFees: Money
  Billing?: BillingAddress
  Shipping?: ShippingAddress
  EndDate?: number
  Frequency?: string
  FixedNextAmount?: boolean
  FractionedPayment?: boolean
  FreeCycles?: number
  NextTransactionDebitedFunds?: Money
  NextTransactionFees?: Money
  Migration?: boolean
}

/**
 * Create recurring CIT payin request
 */
export interface CreateRecurringCitPayinRequest {
  Tag?: string
  RecurringPayinRegistrationId: string
  IpAddress?: string
  BrowserInfo?: BrowserInfo
  SecureModeReturnURL: string
  StatementDescriptor?: string
  DebitedFunds?: Money
  Fees?: Money
}

/**
 * Create recurring MIT payin request
 */
export interface CreateRecurringMitPayinRequest {
  Tag?: string
  RecurringPayinRegistrationId: string
  StatementDescriptor?: string
  DebitedFunds?: Money
  Fees?: Money
}

/**
 * Update recurring payment request
 */
export interface UpdateRecurringPaymentRequest {
  Tag?: string
  Status?: RecurringPaymentStatus
  CardId?: string
  Billing?: BillingAddress
  Shipping?: ShippingAddress
}
