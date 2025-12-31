/**
 * Bank account types for the SDK
 */

import type { Address } from './common.js'

/**
 * Bank account type
 */
export type BankAccountType = 'IBAN' | 'GB' | 'US' | 'CA' | 'OTHER'

/**
 * Base bank account
 */
export interface BaseBankAccount {
  Id: string
  Tag?: string
  CreationDate: number
  UserId: string
  OwnerName: string
  OwnerAddress: Address
  Type: BankAccountType
  Active: boolean
}

/**
 * IBAN bank account
 */
export interface IbanBankAccount extends BaseBankAccount {
  Type: 'IBAN'
  IBAN: string
  BIC?: string
}

/**
 * GB bank account
 */
export interface GbBankAccount extends BaseBankAccount {
  Type: 'GB'
  AccountNumber: string
  SortCode: string
}

/**
 * US bank account
 */
export interface UsBankAccount extends BaseBankAccount {
  Type: 'US'
  AccountNumber: string
  ABA: string
  DepositAccountType?: 'CHECKING' | 'SAVINGS'
}

/**
 * CA bank account
 */
export interface CaBankAccount extends BaseBankAccount {
  Type: 'CA'
  BankName: string
  InstitutionNumber: string
  BranchCode: string
  AccountNumber: string
}

/**
 * Other bank account
 */
export interface OtherBankAccount extends BaseBankAccount {
  Type: 'OTHER'
  Country: string
  BIC: string
  AccountNumber: string
}

/**
 * Bank account union type
 */
export type BankAccount =
  | IbanBankAccount
  | GbBankAccount
  | UsBankAccount
  | CaBankAccount
  | OtherBankAccount

/**
 * Create IBAN bank account request
 */
export interface CreateIbanBankAccountRequest {
  Tag?: string
  OwnerName: string
  OwnerAddress: Address
  IBAN: string
  BIC?: string
}

/**
 * Create GB bank account request
 */
export interface CreateGbBankAccountRequest {
  Tag?: string
  OwnerName: string
  OwnerAddress: Address
  AccountNumber: string
  SortCode: string
}

/**
 * Create US bank account request
 */
export interface CreateUsBankAccountRequest {
  Tag?: string
  OwnerName: string
  OwnerAddress: Address
  AccountNumber: string
  ABA: string
  DepositAccountType?: 'CHECKING' | 'SAVINGS'
}

/**
 * Create CA bank account request
 */
export interface CreateCaBankAccountRequest {
  Tag?: string
  OwnerName: string
  OwnerAddress: Address
  BankName: string
  InstitutionNumber: string
  BranchCode: string
  AccountNumber: string
}

/**
 * Create Other bank account request
 */
export interface CreateOtherBankAccountRequest {
  Tag?: string
  OwnerName: string
  OwnerAddress: Address
  Country: string
  BIC: string
  AccountNumber: string
}
