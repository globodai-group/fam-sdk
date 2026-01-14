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
  /** Amount in cents */
  amount: number
  /** Currency code (default: EUR) */
  currency?: string
  /** Whether this is a recurring payment */
  isRecurring: boolean
  /** Payment frequency for recurring payments */
  frequency?: 'MONTHLY' | 'YEARLY'
  /** Whether a discount is applied */
  hasDiscount?: boolean
  /** Display label for the discount */
  discountLabel?: string | null
  /** Original amount before discount (in cents) */
  originalAmount?: number | null
  /** Client app specific metadata */
  metadata?: Record<string, unknown>
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
