/**
 * Type definitions for the SDK
 */

// Common types
export type {
  Address,
  Currency,
  ExecutionType,
  Money,
  PaginatedResponse,
  PaginationParams,
  SecureMode,
  TransactionNature,
  TransactionStatus,
} from './common.js'

// User types
export type {
  BaseUser,
  CreateLegalUserRequest,
  CreateNaturalUserRequest,
  KYCLevel,
  LegalPersonType,
  LegalRepresentative,
  LegalUser,
  NaturalUser,
  PersonType,
  UpdateLegalUserRequest,
  UpdateNaturalUserRequest,
  User,
  UserCategory,
} from './users.js'

// Wallet types
export type { CreateWalletRequest, UpdateWalletRequest, Wallet, WalletStatus } from './wallets.js'

// Payin types
export type {
  BillingAddress,
  BrowserInfo,
  CreateCardDirectPayinRequest,
  CreateRecurringCitPayinRequest,
  CreateRecurringMitPayinRequest,
  CreateRecurringPaymentRequest,
  CreateRefundRequest,
  Payin,
  PayinType,
  RecurringPaymentRegistration,
  RecurringPaymentStatus,
  Refund,
  RefundReason,
  ShippingAddress,
  UpdateRecurringPaymentRequest,
} from './payins.js'

// Payout types
export type { CreatePayoutRequest, Payout, PayoutMode } from './payouts.js'

// Transfer types
export type {
  CreateScaTransferRequest,
  CreateTransferRefundRequest,
  CreateTransferRequest,
  Transfer,
} from './transfers.js'

// Card types
export type {
  Card,
  CardRegistration,
  CardRegistrationStatus,
  CardType,
  CardValidity,
  CreateCardRegistrationRequest,
  CreatePreauthorizationRequest,
  PaymentStatus,
  Preauthorization,
  PreauthorizationStatus,
  UpdateCardRegistrationRequest,
  UpdateCardRequest,
  UpdatePreauthorizationRequest,
} from './cards.js'

// Bank account types
export type {
  BankAccount,
  BankAccountType,
  BaseBankAccount,
  CaBankAccount,
  CreateCaBankAccountRequest,
  CreateGbBankAccountRequest,
  CreateIbanBankAccountRequest,
  CreateOtherBankAccountRequest,
  CreateUsBankAccountRequest,
  GbBankAccount,
  IbanBankAccount,
  OtherBankAccount,
  UsBankAccount,
} from './bank-accounts.js'

// KYC types
export type {
  CreateKycDocumentRequest,
  KycDocument,
  KycDocumentStatus,
  KycDocumentType,
  KycPage,
  RefusedReasonType,
  SubmitKycDocumentRequest,
} from './kyc.js'

// UBO types
export type {
  CreateUboRequest,
  SubmitUboDeclarationRequest,
  Ubo,
  UboDeclaration,
  UboDeclarationRefusedReason,
  UboDeclarationStatus,
  UpdateUboRequest,
} from './ubo.js'

// Recipient types
export type {
  CreateRecipientRequest,
  PayoutMethodType,
  Recipient,
  RecipientSchema,
  RecipientSchemaRequest,
  RecipientStatus,
} from './recipients.js'

// Subscription types
export type {
  RecurringSubscription,
  RegisterSubscriptionRequest,
  SubscriptionFrequency,
  SubscriptionListFilters,
  SubscriptionPayment,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
  SubscriptionWithPayments,
  SyncSubscriptionResponse,
  UpdateSubscriptionRequest,
} from './subscriptions.js'

// Webhook types
export type {
  BaseWebhookEvent,
  FamEventType,
  FamWebhookEvent,
  MangopayEventType,
  MangopayWebhookEvent,
  WebhookEvent,
  WebhookEventType,
  WebhookHandlerConfig,
} from './webhooks.js'

// Portal types
export type {
  CheckoutConfig,
  CreatePortalSessionRequest,
  CreatePortalSessionResponse,
  GetPortalUserResponse,
  PortalLogoutResponse,
  PortalUser,
  PortalWebsiteConfig,
  RefreshPortalSessionResponse,
  ValidatePortalSessionRequest,
  ValidatePortalSessionResponse,
} from './portal.js'
