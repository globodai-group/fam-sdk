/**
 * Common types used across the SDK
 */

/**
 * Currency codes supported by the API
 */
export type Currency =
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'CHF'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'PLN'
  | 'SEK'
  | 'NOK'
  | 'DKK'

/**
 * Money amount representation
 */
export interface Money {
  /** Amount in the smallest currency unit (cents) */
  Amount: number
  /** Currency code */
  Currency: Currency
}

/**
 * Address structure
 */
export interface Address {
  AddressLine1?: string
  AddressLine2?: string
  City?: string
  Region?: string
  PostalCode?: string
  Country?: string
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  per_page?: number
  sort?: string
  order?: 'asc' | 'desc'
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number
    to: number
  }
}

/**
 * Transaction status
 */
export type TransactionStatus = 'CREATED' | 'SUCCEEDED' | 'FAILED'

/**
 * Transaction nature
 */
export type TransactionNature = 'REGULAR' | 'REFUND' | 'REPUDIATION' | 'SETTLEMENT'

/**
 * Execution type
 */
export type ExecutionType = 'WEB' | 'DIRECT' | 'EXTERNAL_INSTRUCTION'

/**
 * Secure mode
 */
export type SecureMode = 'DEFAULT' | 'FORCE' | 'NO_CHOICE'
