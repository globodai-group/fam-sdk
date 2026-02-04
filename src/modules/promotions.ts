/**
 * Promotions module (coupons and promotion codes)
 *
 * Stripe-like promotion system for FAM
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { PaginatedResponse } from '../types/common.js'
import type {
  Coupon,
  CouponListFilters,
  CouponStats,
  CreateCouponRequest,
  CreatePromotionCodeRequest,
  GenerateCodesRequest,
  GenerateCodesResponse,
  PromotionCode,
  PromotionCodeListFilters,
  UpdateCouponRequest,
  UpdatePromotionCodeRequest,
  ValidatePromotionCodeRequest,
  ValidatePromotionCodeResponse,
} from '../types/promotions.js'

/**
 * Promotions API module
 * Manages coupons and promotion codes for discounts
 */
export class PromotionsModule extends BaseModule {
  constructor(client: HttpClient) {
    super(client, '/api/v1/promotions')
  }

  // ==========================================
  // COUPONS
  // ==========================================

  /**
   * Create a new coupon
   *
   * @example
   * // 25% off forever
   * await fam.promotions.createCoupon({
   *   name: 'Welcome Discount',
   *   discountType: 'percent',
   *   percentOff: 25,
   *   duration: 'forever'
   * })
   *
   * @example
   * // €10 off for first 3 months
   * await fam.promotions.createCoupon({
   *   name: 'Launch Offer',
   *   discountType: 'fixed_amount',
   *   amountOff: 1000,
   *   currency: 'EUR',
   *   duration: 'repeating',
   *   durationInBillingCycles: 3
   * })
   */
  async createCoupon(data: CreateCouponRequest): Promise<{ success: boolean; coupon: Coupon }> {
    return this.post<{ success: boolean; coupon: Coupon }>('coupons', data)
  }

  /**
   * Get a coupon by ID
   */
  async getCoupon(couponId: string): Promise<{ success: boolean; coupon: Coupon }> {
    return this.get<{ success: boolean; coupon: Coupon }>(`coupons/${couponId}`)
  }

  /**
   * List all coupons
   */
  async listCoupons(
    filters?: CouponListFilters
  ): Promise<{ success: boolean; coupons: Coupon[]; meta: PaginatedResponse<Coupon>['meta'] }> {
    return this.get<{
      success: boolean
      coupons: Coupon[]
      meta: PaginatedResponse<Coupon>['meta']
    }>('coupons', {
      params: filters as Record<string, string | number | boolean | undefined | null>,
    })
  }

  /**
   * Update a coupon
   */
  async updateCoupon(
    couponId: string,
    data: UpdateCouponRequest
  ): Promise<{ success: boolean; coupon: Coupon }> {
    return this.put<{ success: boolean; coupon: Coupon }>(`coupons/${couponId}`, data)
  }

  /**
   * Delete a coupon
   * Note: This will also delete all associated promotion codes
   */
  async deleteCoupon(couponId: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`coupons/${couponId}`)
  }

  /**
   * Get coupon statistics
   */
  async getCouponStats(): Promise<{ success: boolean; stats: CouponStats }> {
    return this.get<{ success: boolean; stats: CouponStats }>('coupons/stats')
  }

  // ==========================================
  // PROMOTION CODES
  // ==========================================

  /**
   * Create a new promotion code
   *
   * @example
   * // Create a code for an existing coupon
   * await fam.promotions.createPromotionCode({
   *   couponId: 'coup_xxx',
   *   code: 'BIENVENUE25',
   *   maxRedemptions: 100
   * })
   */
  async createPromotionCode(
    data: CreatePromotionCodeRequest
  ): Promise<{ success: boolean; promotionCode: PromotionCode }> {
    return this.post<{ success: boolean; promotionCode: PromotionCode }>('codes', data)
  }

  /**
   * Get a promotion code by ID
   */
  async getPromotionCode(
    codeId: string
  ): Promise<{ success: boolean; promotionCode: PromotionCode }> {
    return this.get<{ success: boolean; promotionCode: PromotionCode }>(`codes/${codeId}`)
  }

  /**
   * List promotion codes
   */
  async listPromotionCodes(filters?: PromotionCodeListFilters): Promise<{
    success: boolean
    promotionCodes: PromotionCode[]
    meta: PaginatedResponse<PromotionCode>['meta']
  }> {
    return this.get<{
      success: boolean
      promotionCodes: PromotionCode[]
      meta: PaginatedResponse<PromotionCode>['meta']
    }>('codes', {
      params: filters as Record<string, string | number | boolean | undefined | null>,
    })
  }

  /**
   * Update a promotion code
   */
  async updatePromotionCode(
    codeId: string,
    data: UpdatePromotionCodeRequest
  ): Promise<{ success: boolean; promotionCode: PromotionCode }> {
    return this.put<{ success: boolean; promotionCode: PromotionCode }>(`codes/${codeId}`, data)
  }

  /**
   * Delete a promotion code
   */
  async deletePromotionCode(codeId: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`codes/${codeId}`)
  }

  /**
   * Validate a promotion code
   * Use this to check if a code is valid before applying it
   *
   * @example
   * const result = await fam.promotions.validateCode({
   *   code: 'BIENVENUE25',
   *   productType: 'mbc',
   *   amount: 2990
   * })
   * if (result.valid) {
   *   console.log(`Discount: ${result.discount.amountOff / 100}€`)
   *   console.log(`Final price: ${result.discount.finalAmount / 100}€`)
   * }
   */
  async validateCode(data: ValidatePromotionCodeRequest): Promise<ValidatePromotionCodeResponse> {
    return this.post<ValidatePromotionCodeResponse>('codes/validate', data)
  }

  /**
   * Generate multiple promotion codes at once
   *
   * @example
   * // Generate 100 unique codes with a prefix
   * await fam.promotions.generateCodes({
   *   couponId: 'coup_xxx',
   *   count: 100,
   *   prefix: 'PROMO',
   *   maxRedemptions: 1  // Single use each
   * })
   */
  async generateCodes(data: GenerateCodesRequest): Promise<GenerateCodesResponse> {
    return this.post<GenerateCodesResponse>('codes/generate', data)
  }

  /**
   * Find a promotion code by its code string
   * Case-insensitive search
   */
  async findByCode(
    code: string
  ): Promise<{ success: boolean; promotionCode: PromotionCode | null }> {
    return this.get<{ success: boolean; promotionCode: PromotionCode | null }>(
      `codes/by-code/${code}`
    )
  }
}
