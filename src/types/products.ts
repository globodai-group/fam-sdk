/**
 * Product types for FAM SDK
 * Products are stable entities that can be linked to subscriptions
 */

import type { PaginationParams } from './common.js'

/**
 * Product entity
 */
export interface Product {
  /** Unique identifier */
  id: string
  /** Website ID this product belongs to */
  websiteId: string
  /** Product name */
  name: string
  /** External identifier (e.g., Exaku subscription_price ID) */
  externalId: string | null
  /** Monthly price in cents */
  monthlyPrice: number
  /** Yearly price in cents */
  yearlyPrice: number
  /** Currency code (ISO 4217) */
  currency: string
  /** Whether the product is active */
  isActive: boolean
  /** Environment (sandbox/production) - determined by API token */
  environment: string | null
  /** Free-form metadata */
  metadata: Record<string, unknown> | null
  /** Creation timestamp */
  createdAt: string
  /** Last update timestamp */
  updatedAt: string
}

/**
 * Product list filters
 */
export interface ProductListFilters extends PaginationParams {
  /** Filter by active status */
  isActive?: boolean
  /** Filter by external ID */
  externalId?: string
  /** Filter by environment (sandbox/production) */
  environment?: string
}

/**
 * Create product request
 */
export interface CreateProductRequest {
  /** Product name */
  name: string
  /** External identifier */
  externalId?: string
  /** Monthly price in cents */
  monthlyPrice: number
  /** Yearly price in cents */
  yearlyPrice: number
  /** Currency code (default: EUR) */
  currency?: string
  /** Whether the product is active (default: true) */
  isActive?: boolean
  /** Free-form metadata */
  metadata?: Record<string, unknown>
}

/**
 * Update product request
 */
export interface UpdateProductRequest {
  /** Product name */
  name?: string
  /** External identifier */
  externalId?: string
  /** Monthly price in cents */
  monthlyPrice?: number
  /** Yearly price in cents */
  yearlyPrice?: number
  /** Currency code */
  currency?: string
  /** Whether the product is active */
  isActive?: boolean
  /** Free-form metadata */
  metadata?: Record<string, unknown>
}

/**
 * Upsert product request (by external ID or name)
 */
export interface UpsertProductRequest {
  /** Product name */
  name: string
  /** External identifier (optional - for linking to client app entities) */
  externalId?: string
  /** Monthly price in cents */
  monthlyPrice: number
  /** Yearly price in cents */
  yearlyPrice: number
  /** Currency code (default: EUR) */
  currency?: string
  /** Whether the product is active (default: true) */
  isActive?: boolean
  /** Free-form metadata */
  metadata?: Record<string, unknown>
}

/**
 * Upsert product response
 */
export interface UpsertProductResponse extends Product {
  /** Whether a new product was created (true) or existing updated (false) */
  _created: boolean
}

/**
 * Delete product response
 */
export interface DeleteProductResponse {
  success: boolean
  message: string
}
