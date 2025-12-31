/**
 * Cards module
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type {
  Card,
  CardRegistration,
  CreateCardRegistrationRequest,
  CreatePreauthorizationRequest,
  Preauthorization,
  UpdateCardRegistrationRequest,
  UpdateCardRequest,
  UpdatePreauthorizationRequest,
} from '../types/cards.js'
import type { PaginatedResponse, PaginationParams } from '../types/common.js'

/**
 * Card Registrations API module
 */
export class CardRegistrationsModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/mangopay/cardRegistrations')
  }

  /**
   * Create a card registration
   */
  async create(data: CreateCardRegistrationRequest): Promise<CardRegistration> {
    return this.post<CardRegistration>('', data)
  }

  /**
   * Get a card registration by ID
   */
  async getRegistration(registrationId: string): Promise<CardRegistration> {
    return this.client.get<CardRegistration>(this.path(registrationId))
  }

  /**
   * Update a card registration (complete registration process)
   */
  async update(
    registrationId: string,
    data: UpdateCardRegistrationRequest
  ): Promise<CardRegistration> {
    return this.put<CardRegistration>(registrationId, data)
  }
}

/**
 * Cards API module
 */
export class CardsModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/mangopay/cards')
  }

  /**
   * Get a card by ID
   */
  async getCard(cardId: string): Promise<Card> {
    return this.client.get<Card>(this.path(cardId))
  }

  /**
   * Deactivate a card
   */
  async deactivate(cardId: string): Promise<Card> {
    const data: UpdateCardRequest = { Active: false }
    return this.post<Card>(`${cardId}/desactivate`, data)
  }

  /**
   * Get card preauthorizations
   */
  async getPreauthorizations(
    cardId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Preauthorization>> {
    return this.client.get<PaginatedResponse<Preauthorization>>(
      this.path([cardId, 'preauthorizations']),
      { params: params as Record<string, string | number | boolean | undefined | null> }
    )
  }
}

/**
 * Preauthorizations API module
 */
export class PreauthorizationsModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/mangopay/preauthorizations')
  }

  /**
   * Create a preauthorization
   */
  async create(data: CreatePreauthorizationRequest): Promise<Preauthorization> {
    return this.post<Preauthorization>('', data)
  }

  /**
   * Get a preauthorization by ID
   */
  async getPreauthorization(preauthorizationId: string): Promise<Preauthorization> {
    return this.client.get<Preauthorization>(this.path(preauthorizationId))
  }

  /**
   * Update a preauthorization (cancel)
   */
  async update(
    preauthorizationId: string,
    data: UpdatePreauthorizationRequest
  ): Promise<Preauthorization> {
    return this.put<Preauthorization>(preauthorizationId, data)
  }

  /**
   * Cancel a preauthorization
   */
  async cancel(preauthorizationId: string): Promise<Preauthorization> {
    return this.update(preauthorizationId, { PaymentStatus: 'CANCELED' })
  }
}
