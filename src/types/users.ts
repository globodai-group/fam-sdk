/**
 * User types for the SDK
 */

import type { Address } from './common.js'

/**
 * User person type
 */
export type PersonType = 'NATURAL' | 'LEGAL'

/**
 * KYC level
 */
export type KYCLevel = 'LIGHT' | 'REGULAR'

/**
 * Legal person type
 */
export type LegalPersonType = 'BUSINESS' | 'ORGANIZATION' | 'SOLETRADER' | 'PARTNERSHIP'

/**
 * User category
 */
export type UserCategory = 'PAYER' | 'OWNER'

/**
 * Base user interface
 */
export interface BaseUser {
  Id: string
  Tag?: string
  CreationDate: number
  PersonType: PersonType
  Email: string
  KYCLevel: KYCLevel
  TermsAndConditionsAccepted: boolean
  TermsAndConditionsAcceptedDate?: number
  UserCategory: UserCategory
}

/**
 * Natural user (individual)
 */
export interface NaturalUser extends BaseUser {
  PersonType: 'NATURAL'
  FirstName: string
  LastName: string
  Address?: Address
  Birthday?: number
  Nationality?: string
  CountryOfResidence?: string
  Occupation?: string
  IncomeRange?: number
  ProofOfIdentity?: string
  ProofOfAddress?: string
}

/**
 * Legal user representative
 */
export interface LegalRepresentative {
  FirstName: string
  LastName: string
  Birthday: number
  Nationality: string
  CountryOfResidence: string
  Email?: string
}

/**
 * Legal user (company)
 */
export interface LegalUser extends BaseUser {
  PersonType: 'LEGAL'
  LegalPersonType: LegalPersonType
  Name: string
  LegalRepresentativeFirstName: string
  LegalRepresentativeLastName: string
  LegalRepresentativeAddress?: Address
  LegalRepresentativeBirthday?: number
  LegalRepresentativeNationality?: string
  LegalRepresentativeCountryOfResidence?: string
  LegalRepresentativeEmail?: string
  HeadquartersAddress?: Address
  CompanyNumber?: string
}

/**
 * User type union
 */
export type User = NaturalUser | LegalUser

/**
 * Create natural user request
 */
export interface CreateNaturalUserRequest {
  Tag?: string
  Email: string
  FirstName: string
  LastName: string
  Address?: Address
  Birthday?: number
  Nationality?: string
  CountryOfResidence?: string
  Occupation?: string
  IncomeRange?: number
  TermsAndConditionsAccepted?: boolean
  UserCategory?: UserCategory
}

/**
 * Update natural user request
 */
export interface UpdateNaturalUserRequest {
  Tag?: string
  Email?: string
  FirstName?: string
  LastName?: string
  Address?: Address
  Birthday?: number
  Nationality?: string
  CountryOfResidence?: string
  Occupation?: string
  IncomeRange?: number
  TermsAndConditionsAccepted?: boolean
  UserCategory?: UserCategory
}

/**
 * Create legal user request
 */
export interface CreateLegalUserRequest {
  Tag?: string
  Email: string
  Name: string
  LegalPersonType: LegalPersonType
  LegalRepresentativeFirstName: string
  LegalRepresentativeLastName: string
  LegalRepresentativeAddress?: Address
  LegalRepresentativeBirthday?: number
  LegalRepresentativeNationality?: string
  LegalRepresentativeCountryOfResidence?: string
  LegalRepresentativeEmail?: string
  HeadquartersAddress?: Address
  CompanyNumber?: string
  TermsAndConditionsAccepted?: boolean
  UserCategory?: UserCategory
}

/**
 * Update legal user request
 */
export interface UpdateLegalUserRequest {
  Tag?: string
  Email?: string
  Name?: string
  LegalPersonType?: LegalPersonType
  LegalRepresentativeFirstName?: string
  LegalRepresentativeLastName?: string
  LegalRepresentativeAddress?: Address
  LegalRepresentativeBirthday?: number
  LegalRepresentativeNationality?: string
  LegalRepresentativeCountryOfResidence?: string
  LegalRepresentativeEmail?: string
  HeadquartersAddress?: Address
  CompanyNumber?: string
  TermsAndConditionsAccepted?: boolean
  UserCategory?: UserCategory
}
