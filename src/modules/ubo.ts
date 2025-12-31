/**
 * UBO module
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { CreateUboRequest, Ubo, UboDeclaration, UpdateUboRequest } from '../types/ubo.js'

/**
 * UBO Declarations API module (user-scoped)
 */
export class UboModule extends BaseModule {
  constructor(client: HttpClient, userId: string) {
    super(client, `/api/v1/mangopay/users/${userId}/kyc/ubodeclarations`)
  }

  /**
   * Create a UBO declaration
   */
  async createDeclaration(): Promise<UboDeclaration> {
    return this.post<UboDeclaration>('')
  }

  /**
   * Get a UBO declaration by ID
   */
  async getDeclaration(declarationId: string): Promise<UboDeclaration> {
    return this.client.get<UboDeclaration>(this.path(declarationId))
  }

  /**
   * Create a UBO (Ultimate Beneficial Owner)
   */
  async createUbo(declarationId: string, data: CreateUboRequest): Promise<Ubo> {
    return this.post<Ubo>(`${declarationId}/ubos`, data)
  }

  /**
   * Update a UBO
   */
  async updateUbo(declarationId: string, uboId: string, data: UpdateUboRequest): Promise<Ubo> {
    return this.put<Ubo>(`${declarationId}/ubos/${uboId}`, data)
  }

  /**
   * Submit a UBO declaration for validation
   */
  async submit(declarationId: string): Promise<UboDeclaration> {
    return this.put<UboDeclaration>(declarationId, { Status: 'VALIDATION_ASKED' })
  }
}
