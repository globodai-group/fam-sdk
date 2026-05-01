/**
 * Cross-entry-point identity tests.
 *
 * These tests guard against the regression where a class imported from the
 * root entry-point (`globodai-fam-sdk`) and the same class imported from a
 * subpath (`globodai-fam-sdk/webhooks`) resolved to two different runtime
 * constructors after bundling, breaking `instanceof` for consumers.
 *
 * They run against the published-style entry-points by importing from the
 * package root and from the subpath. If a future refactor reintroduces the
 * dual-bundle issue, these tests will fail.
 */

import { describe, expect, it } from 'vitest'
import {
  WebhookPayloadError as RootPayloadError,
  WebhookSignatureError as RootSignatureError,
  Webhooks as RootWebhooks,
} from '../index.js'
import {
  WebhookPayloadError as SubpathPayloadError,
  WebhookSignatureError as SubpathSignatureError,
  Webhooks as SubpathWebhooks,
} from '../webhooks/index.js'

describe('cross-entry-point class identity', () => {
  it('exposes the same Webhooks constructor from root and /webhooks', () => {
    expect(RootWebhooks).toBe(SubpathWebhooks)
  })

  it('exposes the same WebhookSignatureError constructor from root and /webhooks', () => {
    expect(RootSignatureError).toBe(SubpathSignatureError)
  })

  it('exposes the same WebhookPayloadError constructor from root and /webhooks', () => {
    expect(RootPayloadError).toBe(SubpathPayloadError)
  })

  it('throws errors that are instanceof the root classes when imported via /webhooks', () => {
    const wh = new SubpathWebhooks({ signingSecret: 'secret' })

    let caught: unknown
    try {
      wh.constructEvent('not-json', undefined)
    } catch (err) {
      caught = err
    }

    expect(caught).toBeInstanceOf(RootSignatureError)
    expect(caught).toBeInstanceOf(SubpathSignatureError)
  })

  it('throws WebhookPayloadError that is instanceof the root class when payload is malformed', () => {
    const wh = new SubpathWebhooks({ signingSecret: 'secret' })

    let caught: unknown
    try {
      wh.parse('{}')
    } catch (err) {
      caught = err
    }

    expect(caught).toBeInstanceOf(RootPayloadError)
    expect(caught).toBeInstanceOf(SubpathPayloadError)
    expect(caught).not.toBeInstanceOf(RootSignatureError)
  })
})
