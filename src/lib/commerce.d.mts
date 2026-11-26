import type { MatchResult } from './match-preview.mjs';
export const ORDER_STATES: string[];
export const REPORT_STATES: string[];
export const SIMULATION_PRICING: { inputMicroUsdPerMillion: number; outputMicroUsdPerMillion: number };
export class CommerceError extends Error { code: string; }
export type Order = { id: string; recoveryCode: string; idempotencyKey: string; productId: string; productName: string; amountCents: number; currency: 'USD'; simulated: true; status: 'created' | 'checkout_pending' | 'paid_simulated' | 'failed' | 'canceled' | 'fulfilled'; history: { status: string; at: string }[]; sessionId?: string; reportInput: { index: number; dimensions: Record<string, number> } };
export type Report = { orderId: string; status: 'queued' | 'generating' | 'ready' | 'failed'; history: { status: string; at: string }[]; content?: { summary: string; themes: { key: string; reflection: string; activity: string }[] }; input?: { index: number; dimensions: Record<string, number> }; simulatedCostMicroUsd?: number; actualChargeMicroUsd?: 0; generatedAt?: string; error?: string };
type Rel = 'partner' | 'crush' | 'friendship';
export function mockPaymentProvider(): any;
export function deterministicReportAdapter(result: MatchResult, locale: 'en' | 'es', relationship: Rel): any;
export function createCommerce(opts: { catalog: readonly { id: string; name: string; priceCents: number }[]; provider?: any; now?: () => string; persist?: ((d: { orders: Order[]; reports: Report[] }) => void) | null; load?: (() => { orders: Order[]; reports: Report[] } | null) | null }): {
  createOrder(o: { productId: string; idempotencyKey: string; result: MatchResult; locale: 'en' | 'es'; relationship: Rel }): Order;
  startCheckout(orderId: string, details?: Record<string, unknown>): { sessionId: string; simulated: true };
  handleEvent(e: any): { duplicate: boolean; order: Order };
  pay(orderId: string, outcome?: 'succeed' | 'decline' | 'network_error'): Order;
  generateReport(orderId: string, o: { result: MatchResult; locale: 'en' | 'es'; relationship: Rel; adapter?: any }): Promise<Report>;
  recover(code: string): { order: Order; report: Report | null };
  cancel(orderId: string): Order;
  get(orderId: string): Order;
  provider: any;
};
export function reportHtml(report: Report, order: Order, es: boolean): string;
