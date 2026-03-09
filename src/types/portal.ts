/**
 * Portal types for FAM Payment Portal
 *
 * These types are used for creating and managing portal sessions
 * that allow users to access the payment portal from client apps.
 */

/**
 * Checkout configuration passed from client apps
 * Generic - works with any product from any client application
 */
export interface CheckoutConfig {
  /** Product type identifier (e.g., 'subscription', 'service', 'course') */
  productType: string
  /** Display label for the product */
  productLabel: string
  /** Optional product description */
  productDescription?: string | null
  /** Amount in cents (monthly price if frequency selector shown) */
  amount: number
  /** Currency code (default: EUR) */
  currency?: string
  /** Whether this is a recurring payment */
  isRecurring: boolean
  /** Payment frequency - if set, locks frequency (no selector shown in portal) */
  frequency?: 'MONTHLY' | 'YEARLY'
  /** Amount in cents for yearly plan (only used when frequency selector is shown) */
  yearlyAmount?: number | null
  /** Savings label for yearly plan (e.g., "2 mois offerts", "-17%") */
  yearlySavingsLabel?: string | null
  /** Whether a discount is applied */
  hasDiscount?: boolean
  /** Display label for the discount */
  discountLabel?: string | null
  /** Original amount before discount (in cents) */
  originalAmount?: number | null
  /** Required: Platform/merchant wallet ID to receive payment */
  creditedWalletId: string
  /** Optional: Platform/merchant user ID (for fees) */
  creditedUserId?: string
  /** Required: User ID in client app (e.g., Exaku user ID) */
  externalUserId: string
  /** Optional: Subscription ID in client app */
  externalSubscriptionId?: string
  /** Client app specific metadata */
  metadata?: Record<string, unknown>
  /** Custom tag for MangoPay (max 255 chars, will be truncated if longer) */
  tag?: string
  /** Number of days for free trial (first charge delayed by this many days) */
  trialDays?: number
  /**
   * Number of free billing cycles (first payment is €0, then free for X cycles)
   * Use this for downgrade from yearly to monthly - set to months remaining on yearly
   * Takes precedence over trialDays if both are set
   */
  freeCycles?: number
  /** Custom statement descriptor shown on bank statement (max 10 chars, will be truncated) */
  statementDescriptor?: string
  /**
   * Allow promotion codes in checkout
   * If true, shows a promo code input field in the checkout form
   */
  allowPromotionCodes?: boolean
  /**
   * Pre-applied promotion code
   * If set, the code will be validated and applied at checkout
   * The portal will show the discount without requiring user input
   */
  promotionCode?: string | null
}

/**
 * Website configuration for portal theming
 */
export interface PortalWebsiteConfig {
  id: string
  name: string | null
  domain: string | null
  logoUrl: string | null
  faviconUrl: string | null
  supportEmail: string | null
  supportUrl: string | null
  termsUrl: string | null
  privacyUrl: string | null
  primaryColor: string | null
  secondaryColor: string | null
  accentColor: string | null
}

/**
 * Portal user information from MangoPay
 */
export interface PortalUser {
  /** MangoPay user ID */
  mangopayId: string
  /** User email */
  email: string | null
  /** First name (for natural users) */
  firstName: string | null
  /** Last name (for natural users) */
  lastName: string | null
  /** Person type: NATURAL or LEGAL */
  personType: 'NATURAL' | 'LEGAL' | null
}

/**
 * Request to create a portal session
 */
export interface CreatePortalSessionRequest {
  /** The MangoPay user ID to create the session for */
  mangopayUserId: string
  /** URL to redirect to after portal actions (optional) */
  returnUrl?: string
  /** Session expiration in minutes (default: 60, max: 1440) */
  expiresInMinutes?: number
  /** Optional checkout configuration for direct checkout flow */
  checkoutConfig?: CheckoutConfig
  /**
   * Filter subscriptions by external user ID
   * When set, only subscriptions matching this externalUserId will be shown in the portal
   * Useful when multiple users share the same MangoPay account
   */
  filterByExternalUserId?: string
}

/**
 * Response from creating a portal session
 */
export interface CreatePortalSessionResponse {
  success: boolean
  data: {
    /** The session ID */
    sessionId: string
    /** The session token (64 chars) */
    token: string
    /** Full URL to redirect user to portal */
    url: string
    /** Session expiration datetime (ISO string) */
    expiresAt: string
  }
}

/**
 * Request to validate a portal session
 */
export interface ValidatePortalSessionRequest {
  /** The session token to validate */
  token: string
}

/**
 * Response from validating a portal session
 */
export interface ValidatePortalSessionResponse {
  success: boolean
  valid: boolean
  data: {
    /** The session ID */
    sessionId: string
    /** Session expiration datetime (ISO string) */
    expiresAt: string
    /** Return URL for redirect after portal actions */
    returnUrl: string | null
    /** Checkout configuration (if provided when creating session) */
    checkoutConfig: CheckoutConfig | null
    /** User information from MangoPay */
    user: PortalUser
    /** Website configuration for theming */
    website: PortalWebsiteConfig
    /** Filter to apply when listing subscriptions (if set during session creation) */
    filterByExternalUserId: string | null
  }
}

/**
 * Response from getting portal user
 */
export interface GetPortalUserResponse {
  success: boolean
  data: PortalUser
}

/**
 * Response from refreshing portal session
 */
export interface RefreshPortalSessionResponse {
  success: boolean
  data: {
    /** New expiration datetime (ISO string) */
    expiresAt: string
  }
}

/**
 * Response from portal logout
 */
export interface PortalLogoutResponse {
  success: boolean
  message: string
}

/**
 * Billing info data structure (flat format for API transport)
 */
export interface BillingInfoData {
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  addressLine1: string
  addressLine2: string | null
  city: string
  postalCode: string
  country: string
  isCompany: boolean
  companyName: string | null
  vatNumber: string | null
}

/**
 * Response from getting billing info
 */
export interface GetBillingInfoResponse {
  success: boolean
  data: {
    saved: boolean
    billingInfo?: BillingInfoData
  }
}

/**
 * Response from saving billing info
 */
export interface SaveBillingInfoResponse {
  success: boolean
  data: BillingInfoData
}

/**
 * Response from getting portal session status
 */
export interface GetPortalSessionStatusResponse {
  success: boolean
  data: {
    /** The session ID */
    sessionId: string
    /** Session status: pending, succeeded, failed, or expired */
    status: 'pending' | 'succeeded' | 'failed' | 'expired'
    /** MangoPay PayIn ID (if payment was attempted) */
    lastPayinId: string | null
    /** Whether the checkout webhook was already sent */
    webhookSent: boolean
    /** Checkout configuration (if provided when creating session) */
    checkoutConfig: CheckoutConfig | null
    /** Session expiration datetime (ISO string) */
    expiresAt: string
    /** Session creation datetime (ISO string) */
    createdAt: string
  }
}

/**
 * A single payment item returned by the portal payments list
 */
export interface PortalPaymentItem {
  id: string
  payinId: string
  type: 'CIT' | 'MIT' | 'DIRECT'
  status: string
  amount: number
  currency: string
  productType: string | null
  productLabel: string | null
  resultCode: string | null
  resultMessage: string | null
  createdAt: string
}

/**
 * Response from listing portal payments
 */
export interface ListPortalPaymentsResponse {
  success: boolean
  data: {
    payments: PortalPaymentItem[]
    total: number
    page: number
    limit: number
  }
}
