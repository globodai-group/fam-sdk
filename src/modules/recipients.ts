/**
 * SCA Recipients module
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { PaginatedResponse, PaginationParams } from '../types/common.js'
import type {
  CreateRecipientRequest,
  Recipient,
  RecipientSchema,
  RecipientSchemaRequest,
} from '../types/recipients.js'

/**
 * SCA Recipients API module (user-scoped)
 */
export class ScaRecipientsModule extends BaseModule {
  constructor(client: HttpClient, userId: string) {
    super(client, `/api/v1/mangopay/users/${userId}/recipients`)
  }

  /**
   * Create a recipient
   */
  async create(data: CreateRecipientRequest): Promise<Recipient> {
    return this.post<Recipient>('', data)
  }

  /**
   * Get a recipient by ID
   */
  async getRecipient(recipientId: string): Promise<Recipient> {
    return this.client.get<Recipient>(this.path(recipientId))
  }

  /**
   * List user's recipients
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<Recipient>> {
    return this.client.get<PaginatedResponse<Recipient>>(this.path(''), {
      params: params as Record<string, string | number | boolean | undefined | null>,
    })
  }

  /**
   * Get recipient schema (required fields for a specific payout method)
   */
  async getSchema(request: RecipientSchemaRequest): Promise<RecipientSchema> {
    return this.client.get<RecipientSchema>(this.path('schema'), {
      params: request as unknown as Record<string, string | number | boolean | undefined | null>,
    })
  }
}
