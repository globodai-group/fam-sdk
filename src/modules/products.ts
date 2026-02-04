/**
 * Products module (FAM custom implementation)
 * Handles stable product entities that can be linked to subscriptions
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { PaginatedResponse } from '../types/common.js'
import type {
  CreateProductRequest,
  DeleteProductResponse,
  Product,
  ProductListFilters,
  UpdateProductRequest,
  UpsertProductRequest,
  UpsertProductResponse,
} from '../types/products.js'

/**
 * Products API module
 * Manages product catalog for subscriptions
 */
export class ProductsModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/mangopay/products')
  }

  /**
   * List products with optional filters
   *
   * @param filters - Optional filters (isActive, externalId, page, perPage)
   */
  async list(filters?: ProductListFilters): Promise<PaginatedResponse<Product>> {
    return this.client.get<PaginatedResponse<Product>>(this.path(''), {
      params: filters as Record<string, string | number | boolean | undefined | null>,
    })
  }

  /**
   * Get a product by ID
   *
   * @param productId - The product ID
   */
  async getById(productId: string): Promise<Product> {
    return this.client.get<Product>(this.path(productId))
  }

  /**
   * Get a product by external ID
   *
   * @param externalId - The external ID (e.g., Exaku subscription_price ID)
   */
  async getByExternalId(externalId: string): Promise<Product> {
    return this.client.get<Product>(this.path(`external/${externalId}`))
  }

  /**
   * Get a product by name
   *
   * @param name - The product name
   */
  async getByName(name: string): Promise<Product> {
    return this.client.get<Product>(this.path(`name/${encodeURIComponent(name)}`))
  }

  /**
   * Create a new product
   *
   * @param data - Product creation data
   */
  async create(data: CreateProductRequest): Promise<Product> {
    return this.post<Product>('', data)
  }

  /**
   * Update a product
   *
   * @param productId - The product ID
   * @param data - Update data
   */
  async update(productId: string, data: UpdateProductRequest): Promise<Product> {
    return this.put<Product>(productId, data)
  }

  /**
   * Upsert a product by external ID
   * Creates if not exists, updates if exists
   *
   * @param externalId - The external ID
   * @param data - Upsert data
   */
  async upsertByExternalId(
    externalId: string,
    data: UpsertProductRequest
  ): Promise<UpsertProductResponse> {
    return this.put<UpsertProductResponse>(`external/${externalId}`, data)
  }

  /**
   * Upsert a product by name
   * Creates if not exists, updates if exists
   * Useful when external ID is not available (e.g., portfolio-whitelabel)
   *
   * @param name - The product name
   * @param data - Upsert data (monthlyPrice, yearlyPrice required; externalId optional)
   */
  async upsertByName(
    name: string,
    data: Omit<UpsertProductRequest, 'name'> & { externalId?: string }
  ): Promise<UpsertProductResponse> {
    return this.put<UpsertProductResponse>(`name/${encodeURIComponent(name)}`, data)
  }

  /**
   * Delete a product
   *
   * @param productId - The product ID
   */
  async remove(productId: string): Promise<DeleteProductResponse> {
    return this.delete<DeleteProductResponse>(productId)
  }

  /**
   * Activate a product
   *
   * @param productId - The product ID
   */
  async activate(productId: string): Promise<Product> {
    return this.update(productId, { isActive: true })
  }

  /**
   * Deactivate a product
   *
   * @param productId - The product ID
   */
  async deactivate(productId: string): Promise<Product> {
    return this.update(productId, { isActive: false })
  }

  /**
   * Find product by external ID or return null
   *
   * @param externalId - The external ID to search for
   */
  async findByExternalId(externalId: string): Promise<Product | null> {
    try {
      return await this.getByExternalId(externalId)
    } catch {
      return null
    }
  }

  /**
   * Find product by name or return null
   *
   * @param name - The product name to search for
   */
  async findByName(name: string): Promise<Product | null> {
    try {
      return await this.getByName(name)
    } catch {
      return null
    }
  }
}
