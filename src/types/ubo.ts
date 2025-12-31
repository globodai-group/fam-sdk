/**
 * UBO (Ultimate Beneficial Owner) types for the SDK
 */

import type { Address } from './common.js'

/**
 * UBO declaration status
 */
export type UboDeclarationStatus =
  | 'CREATED'
  | 'VALIDATION_ASKED'
  | 'INCOMPLETE'
  | 'VALIDATED'
  | 'REFUSED'

/**
 * UBO declaration refused reason
 */
export type UboDeclarationRefusedReason =
  | 'MISSING_UBO'
  | 'WRONG_UBO_INFORMATION'
  | 'UBO_IDENTITY_NEEDED'
  | 'SHAREHOLDERS_DECLARATION_NEEDED'
  | 'ORGANIZATION_CHART_NEEDED'
  | 'DOCUMENTS_NEEDED'
  | 'DECLARATION_DO_NOT_MATCH_UBO_INFORMATION'
  | 'SPECIFIC_CASE'

/**
 * UBO declaration entity
 */
export interface UboDeclaration {
  Id: string
  CreationDate: number
  UserId: string
  Status: UboDeclarationStatus
  ProcessedDate?: number
  Reason?: UboDeclarationRefusedReason
  Message?: string
  Ubos: Ubo[]
}

/**
 * UBO (Ultimate Beneficial Owner) entity
 */
export interface Ubo {
  Id: string
  CreationDate: number
  FirstName: string
  LastName: string
  Address: Address
  Nationality: string
  Birthday: number
  Birthplace: {
    City: string
    Country: string
  }
  IsActive: boolean
}

/**
 * Create UBO request
 */
export interface CreateUboRequest {
  FirstName: string
  LastName: string
  Address: Address
  Nationality: string
  Birthday: number
  Birthplace: {
    City: string
    Country: string
  }
}

/**
 * Update UBO request
 */
export interface UpdateUboRequest {
  FirstName?: string
  LastName?: string
  Address?: Address
  Nationality?: string
  Birthday?: number
  Birthplace?: {
    City: string
    Country: string
  }
  IsActive?: boolean
}

/**
 * Submit UBO declaration request
 */
export interface SubmitUboDeclarationRequest {
  Status: 'VALIDATION_ASKED'
}
