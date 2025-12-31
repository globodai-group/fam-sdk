/**
 * KYC module
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { PaginatedResponse, PaginationParams } from '../types/common.js'
import type { CreateKycDocumentRequest, KycDocument } from '../types/kyc.js'

/**
 * KYC Documents API module (user-scoped)
 */
export class KycModule extends BaseModule {
  constructor(client: HttpClient, userId: string) {
    super(client, `/api/v1/mangopay/users/${userId}/kyc/documents`)
  }

  /**
   * Create a KYC document
   */
  async create(data: CreateKycDocumentRequest): Promise<KycDocument> {
    return this.post<KycDocument>('', data)
  }

  /**
   * Get a KYC document by ID
   */
  async getDocument(documentId: string): Promise<KycDocument> {
    return this.client.get<KycDocument>(this.path(documentId))
  }

  /**
   * List user's KYC documents
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<KycDocument>> {
    return this.client.get<PaginatedResponse<KycDocument>>(this.path(''), {
      params: params as Record<string, string | number | boolean | undefined | null>,
    })
  }

  /**
   * Create a KYC document page (upload file)
   */
  async createPage(documentId: string, fileBase64: string): Promise<void> {
    await this.post<undefined>(`${documentId}/pages`, { File: fileBase64 })
  }

  /**
   * Submit a KYC document for validation
   */
  async submit(documentId: string): Promise<KycDocument> {
    return this.put<KycDocument>(documentId, { Status: 'VALIDATION_ASKED' })
  }
}
