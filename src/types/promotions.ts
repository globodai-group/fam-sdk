/**
 * Promotion types for FAM SDK
 *
 * Stripe-like promotion system:
 * - Coupons: Define discount rules (% off, fixed amount, duration)
 * - Promotion Codes: Customer-facing codes linked to coupons
 * - Usages: Track which users used which codes
 */

import type { Currency, PaginationParams } from './common.js'

/**
 * Coupon discount type
 */
export type CouponDiscountType = 'percent' | 'fixed_amount'

/**
 * Coupon duration
 */
export type CouponDuration = 'forever' | 'once' | 'repeating'

/**
 * Coupon entity
 */
export interface Coupon {
  id: string
  websiteId: string
  name: string
  discountType: CouponDiscountType
  /** Percentage off (1-100) - only for discountType = 'percent' */
  percentOff: number | null
  /** Amount off in cents - only for discountType = 'fixed_amount' */
  amountOff: number | null
  /** Currency for fixed_amount discounts */
  currency: Currency
  /** How long the discount lasts */
  duration: CouponDuration
  /** Number of billing cycles (only for duration = 'repeating') */
  durationInBillingCycles: number | null
  /** Max redemptions across all codes */
  maxRedemptions: number | null
  /** Total redemptions count */
  redemptionsCount: number
  /** Product types this coupon applies to (empty = all) */
  appliesToProducts: string[] | null
  /** Minimum order amount in cents */
  minimumAmount: number | null
  /** When the coupon becomes valid */
  validFrom: string
  /** When the coupon expires (null = never) */
  validUntil: string | null
  /** Whether the coupon is active */
  isActive: boolean
  /** Custom metadata */
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

/**
 * Promotion Code entity
 */
export interface PromotionCode {
  id: string
  couponId: string
  /** Environment (sandbox/production) */
  environment: string | null
  /** Customer-facing code (e.g., "BIENVENUE25") */
  code: string
  /** Max redemptions for this specific code */
  maxRedemptions: number | null
  /** Current redemptions count */
  redemptionsCount: number
  /** Only for first-time customers */
  firstTimeOnly: boolean
  /** Override coupon's minimum amount */
  minimumAmount: number | null
  /** Specific user IDs that can use this code (null = all) */
  restrictedToUsers: string[] | null
  /** Whether the code is active */
  isActive: boolean
  /** Code expiration date */
  expiresAt: string | null
  /** Custom metadata */
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  /** Linked coupon (if preloaded) */
  coupon?: Coupon
}

/**
 * Promotion Code Usage entity
 */
export interface PromotionCodeUsage {
  id: string
  promotionCodeId: string
  couponId: string
  /** FAM MangopayEntity ID (not MangoPay ID) */
  mangopayEntityId: string
  /** Original amount before discount (in cents) */
  originalAmount: number
  /** Discount amount applied (in cents) */
  discountAmount: number
  /** Final amount after discount (in cents) */
  finalAmount: number
  /** Environment (sandbox/production) */
  environment: string | null
  /** Linked subscription ID (if applicable) */
  recurringSubscriptionId: string | null
  /** Custom metadata */
  metadata: Record<string, unknown>
  createdAt: string
  /** Linked promotion code (if preloaded) */
  promotionCode?: PromotionCode
  /** Linked coupon (if preloaded) */
  coupon?: Coupon
}

/**
 * Create coupon request
 */
export interface CreateCouponRequest {
  name: string
  discountType: CouponDiscountType
  /** Percentage off (1-100) - required if discountType = 'percent' */
  percentOff?: number
  /** Amount off in cents - required if discountType = 'fixed_amount' */
  amountOff?: number
  /** Currency (default: EUR) */
  currency?: string
  duration: CouponDuration
  /** Required if duration = 'repeating' */
  durationInBillingCycles?: number
  /** Global usage limit */
  maxRedemptions?: number
  /** Product types this coupon applies to (empty = all) */
  appliesToProducts?: string[]
  /** Minimum order amount in cents */
  minimumAmount?: number
  /** When the coupon becomes valid (default: now) */
  validFrom?: string
  /** When the coupon expires (null = never) */
  validUntil?: string
  metadata?: Record<string, unknown>
}

/**
 * Update coupon request
 */
export interface UpdateCouponRequest {
  name?: string
  maxRedemptions?: number | null
  appliesToProducts?: string[] | null
  minimumAmount?: number | null
  validUntil?: string | null
  isActive?: boolean
  metadata?: Record<string, unknown>
}

/**
 * Create promotion code request
 */
export interface CreatePromotionCodeRequest {
  couponId: string
  /** Customer-facing code (auto-generated if not provided) */
  code?: string
  /** Max redemptions for this specific code */
  maxRedemptions?: number
  /** Only for first-time customers */
  firstTimeOnly?: boolean
  /** Override coupon's minimum amount */
  minimumAmount?: number
  /** Specific user IDs that can use this code */
  restrictedToUsers?: string[]
  /** Code expiration date */
  expiresAt?: string
  metadata?: Record<string, unknown>
}

/**
 * Update promotion code request
 */
export interface UpdatePromotionCodeRequest {
  maxRedemptions?: number | null
  minimumAmount?: number | null
  restrictedToUsers?: string[] | null
  expiresAt?: string | null
  isActive?: boolean
  metadata?: Record<string, unknown>
}

/**
 * Validate promotion code request
 */
export interface ValidatePromotionCodeRequest {
  code: string
  productType?: string
  /** Amount in cents */
  amount: number
}

/**
 * Discount information
 */
export interface DiscountInfo {
  type: CouponDiscountType
  value: number
  amountOff: number
  finalAmount: number
}

/**
 * Validate promotion code response
 */
export interface ValidatePromotionCodeResponse {
  success: boolean
  valid: boolean
  error?: string
  discount?: DiscountInfo
  coupon?: {
    name: string
    duration: CouponDuration
    durationInBillingCycles: number | null
  }
}

/**
 * Generate codes request
 */
export interface GenerateCodesRequest {
  couponId: string
  count: number
  prefix?: string
  maxRedemptions?: number
  firstTimeOnly?: boolean
  expiresAt?: string
}

/**
 * Generated code
 */
export interface GeneratedCode {
  id: string
  code: string
}

/**
 * Generate codes response
 */
export interface GenerateCodesResponse {
  success: boolean
  couponId: string
  codesGenerated: number
  codes: GeneratedCode[]
}

/**
 * Coupon list filters
 */
export interface CouponListFilters extends PaginationParams {
  isActive?: boolean
  discountType?: CouponDiscountType
  duration?: CouponDuration
}

/**
 * Promotion code list filters
 */
export interface PromotionCodeListFilters extends PaginationParams {
  couponId?: string
  isActive?: boolean
  code?: string
}

/**
 * Coupon stats
 */
export interface CouponStats {
  totalCoupons: number
  activeCoupons: number
  totalRedemptions: number
  totalDiscountAmount: number
}
