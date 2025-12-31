/**
 * KYC types for the SDK
 */

/**
 * KYC document type
 */
export type KycDocumentType =
  | 'IDENTITY_PROOF'
  | 'REGISTRATION_PROOF'
  | 'ARTICLES_OF_ASSOCIATION'
  | 'SHAREHOLDER_DECLARATION'
  | 'ADDRESS_PROOF'

/**
 * KYC document status
 */
export type KycDocumentStatus =
  | 'CREATED'
  | 'VALIDATION_ASKED'
  | 'VALIDATED'
  | 'REFUSED'
  | 'OUT_OF_DATE'

/**
 * Refused reason type
 */
export type RefusedReasonType =
  | 'DOCUMENT_UNREADABLE'
  | 'DOCUMENT_NOT_ACCEPTED'
  | 'DOCUMENT_HAS_EXPIRED'
  | 'DOCUMENT_INCOMPLETE'
  | 'DOCUMENT_MISSING'
  | 'DOCUMENT_DO_NOT_MATCH_USER_DATA'
  | 'DOCUMENT_DO_NOT_MATCH_ACCOUNT_DATA'
  | 'DOCUMENT_FALSIFIED'
  | 'UNDERAGE_PERSON'
  | 'SPECIFIC_CASE'

/**
 * KYC document entity
 */
export interface KycDocument {
  Id: string
  Tag?: string
  CreationDate: number
  UserId: string
  Type: KycDocumentType
  Status: KycDocumentStatus
  RefusedReasonType?: RefusedReasonType
  RefusedReasonMessage?: string
  ProcessedDate?: number
  Flags?: string[]
}

/**
 * Create KYC document request
 */
export interface CreateKycDocumentRequest {
  Tag?: string
  Type: KycDocumentType
}

/**
 * KYC page
 */
export interface KycPage {
  File: string
}

/**
 * Submit KYC document request
 */
export interface SubmitKycDocumentRequest {
  Status: 'VALIDATION_ASKED'
}
