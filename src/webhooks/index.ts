/**
 * Subpath entry-point: `globodai-fam-sdk/webhooks`.
 *
 * This file is intentionally a thin re-export of the package root. Marking
 * `globodai-fam-sdk` as `external` in the bundler config means the produced
 * `dist/webhooks/index.{cjs,js}` does not duplicate the runtime classes;
 * instead, it delegates to `dist/index.{cjs,js}` at load time. As a result,
 * the `Webhooks`, `WebhookSignatureError` and `WebhookPayloadError` classes
 * referenced via the subpath are the same runtime constructors as those
 * referenced via the root, so `instanceof` checks behave consistently
 * regardless of where consumers import from.
 */

export {
  Webhooks,
  WebhookPayloadError,
  WebhookSignatureError,
  isFamEvent,
  isMangopayEvent,
} from 'globodai-fam-sdk'

export type {
  BaseWebhookEvent,
  FamEventType,
  FamWebhookEvent,
  MangopayEventType,
  MangopayWebhookEvent,
  ResourceId,
  WebhookEvent,
  WebhookEventType,
  WebhookHandlerConfig,
} from 'globodai-fam-sdk'
