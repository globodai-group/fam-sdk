/**
 * IDV Sessions module (user-scoped) — Mangopay hosted identity
 * verification flow.
 *
 * Mangopay only exposes a `POST` endpoint to create a session; the
 * lifecycle (`PENDING` → `VALIDATED`/`REFUSED`) is delivered via the
 * `IDV_SESSION_*` webhooks already handled by FAM.
 *
 * Reference: https://docs.mangopay.com/api-reference/idv-sessions
 */

import { BaseModule } from './base.js'
import type { HttpClient } from '../client.js'
import type { CreateIdvSessionRequest, IdvSession } from '../types/idv-sessions.js'

export class IdvSessionsModule extends BaseModule {
  constructor(client: HttpClient, userId: string) {
    super(client, `/api/v1/mangopay/users/${userId}/idv-sessions`)
  }

  /**
   * Create a Mangopay-hosted IDV session for the user.
   * Returns the `HostedUrl` to redirect the user to.
   */
  async create(data: CreateIdvSessionRequest): Promise<IdvSession> {
    return this.post<IdvSession>('', data)
  }
}
