/**
 * MSW Node server — dipakai oleh Vitest (Node environment).
 *
 * @location apps/web/src/tests/mocks/server.ts
 * Di-setup di src/tests/setup.ts via beforeAll / afterAll.
 */
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
