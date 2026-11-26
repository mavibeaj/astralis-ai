'use client';
import {useRef, useState} from 'react';
import {createCommerce, reportHtml, type Order, type Report} from '../../lib/commerce.mjs';
import type {MatchResult} from '../../lib/match-preview.mjs';
import {catalog} from '../../config/product';

type Rel = 'partner' | 'crush' | 'friendship';
const KEY = 'astralis-sim-commerce-v1';
let commerce: ReturnType<typeof createCommerce> | null = null;
export function getCommerce() {
  commerce ??= createCommerce({
    catalog,
    persist: d => {try {localStorage.setItem(KEY, JSON.stringify(d));} catch {}},
    load: () => {try {return JSON.parse(localStorage.getItem(KEY) ?? 'null');} catch {return null;}},
  });
  return commerce;
}
const LABELS_ES: Record<string, string> = {emotional: 'Conexión emocional', communication: 'Comunicación', attraction: 'Atracción simbólica', stability: 'Estabilidad', growth: 'Crecimiento'};
const LABELS_EN: Record<string, string> = {emotional: 'Emotional connection', communication: 'Communication', attraction: 'Symbolic attraction', stability: 'Stability', growth: 'Growth'};

function download(html: string, name: string) {
  const url = URL.createObjectURL(new Blob([html], {type: 'text/html'}));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function printHtml(html: string) {
  const f = document.createElement('iframe'); f.style.position = 'fixed'; f.style.width = '0'; f.style.height = '0'; f.style.border = '0';
  f.srcdoc = html; document.body.appendChild(f);
  f.onload = () => {f.contentWindow?.print(); setTimeout(() => f.remove(), 2000);};
}

export function ReportView({report, order, es}: {report: Report; order: Order; es: boolean}) {
  const labels = es ? LABELS_ES : LABELS_EN;
  const html = reportHtml(report, order, es);
  return <div className="report-view">
    <p className="sim-badge">{es ? 'SIMULACIÓN · no se realizó ningún cobro' : 'SIMULATION · no charge was made'}</p>
    <h3>Cosmic Match Premium · {report.input!.index}/100</h3>
    <p>{report.content!.summary}</p>
    {report.content!.themes.map(t => <article key={t.key}><h4>{labels[t.key]} · {report.input!.dimensions[t.key]}/100</h4><p>{t.reflection}</p><p className="activity">{t.activity}</p></article>)}
    <div className="cta-row">
      <button type="button" className="ghost" onClick={() => download(html, `cosmic-match-premium-${order.id}.html`)}>{es ? 'Descargar informe' : 'Download report'}</button>
      <button type="button" className="ghost" onClick={() => printHtml(html)}>{es ? 'Imprimir / Guardar PDF' : 'Print / Save PDF'}</button>
    </div>
    <p className="recovery">{es ? 'Código de recuperación' : 'Recovery code'}: <code data-testid="recovery-code">{order.recoveryCode}</code></p>
    <small className="fine">{es ? 'En esta simulación el informe se guarda solo en este navegador.' : 'In this simulation the report is stored in this browser only.'}</small>
  </div>;
}

type Phase = 'idle' | 'summary' | 'processing' | 'declined' | 'network' | 'generating' | 'ready' | 'failed';
export default function Checkout({result, lang, relationship, onReady}: {result: MatchResult; lang: 'en' | 'es'; relationship: Rel; onReady?: () => void}) {
  const es = lang === 'es';
  const [phase, setPhase] = useState<Phase>('idle');
  const [outcome, setOutcome] = useState<'succeed' | 'decline' | 'network_error'>('succeed');
  const [order, setOrder] = useState<Order | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const idem = useRef<string>('');
  const product = catalog.find(p => p.id === 'match-premium')!;
  const price = (product.priceCents / 100).toFixed(2);
  const complete = result.status === 'ok';

  function begin() {
    idem.current ||= crypto.randomUUID();
    try {setOrder(getCommerce().createOrder({productId: product.id, idempotencyKey: idem.current, result, locale: lang, relationship})); setPhase('summary');}
    catch {setPhase('failed');}
  }
  async function confirm() {
    if (!order) return;
    const c = getCommerce();
    setPhase('processing');
    await new Promise(r => setTimeout(r, 700));
    try {
      c.startCheckout(order.id);
      const paid = c.pay(order.id, outcome);
      setOrder({...paid});
      if (paid.status === 'failed') {setPhase('declined'); return;}
    } catch (e) {setPhase((e as {code?: string}).code === 'provider_unreachable' ? 'network' : 'failed'); return;}
    setPhase('generating');
    const r = await c.generateReport(order.id, {result, locale: lang, relationship});
    setReport({...r}); setOrder({...c.get(order.id)});
    setPhase(r.status === 'ready' ? 'ready' : 'failed');
    if (r.status === 'ready') onReady?.();
  }

  if (!complete) return <p className="fine">{es ? 'El informe premium requiere ambas horas de nacimiento.' : 'The premium report requires both birth times.'}</p>;
  return <div className="checkout" aria-live="polite">
    {phase === 'idle' && <button type="button" className="primary" onClick={begin}>{es ? 'Obtener informe premium (simulación)' : 'Get premium report (simulation)'}</button>}
    {phase !== 'idle' && phase !== 'ready' && <div className="order-box">
      <p className="sim-badge">{es ? 'MODO SIMULACIÓN · no se realizará ningún cobro ni se solicitan datos de tarjeta' : 'SIMULATION MODE · no charge and no card details requested'}</p>
      <h3>{es ? 'Resumen del pedido' : 'Order summary'}</h3>
      <dl><dt>{es ? 'Producto' : 'Product'}</dt><dd>{product.name}</dd><dt>{es ? 'Total' : 'Total'}</dt><dd>USD {price}</dd><dt>{es ? 'Estado' : 'Status'}</dt><dd data-testid="order-status">{order?.status ?? '—'}</dd></dl>
      {(phase === 'summary' || phase === 'declined' || phase === 'network') && <fieldset className="outcomes"><legend>{es ? 'Resultado simulado del pago (pruebas)' : 'Simulated payment outcome (testing)'}</legend>
        {([['succeed', es ? 'Aprobado' : 'Approved'], ['decline', es ? 'Rechazado' : 'Declined'], ['network_error', es ? 'Error de conexión' : 'Network error']] as const).map(([v, l]) => <label key={v} className="check"><input type="radio" name="sim-outcome" checked={outcome === v} onChange={() => setOutcome(v)}/>{l}</label>)}
      </fieldset>}
      {phase === 'declined' && <p className="error" role="status">{es ? 'Pago simulado rechazado. Puedes intentarlo de nuevo.' : 'Simulated payment declined. You can try again.'}</p>}
      {phase === 'network' && <p className="error" role="status">{es ? 'Error de conexión simulado. El pedido sigue pendiente; puedes reintentar.' : 'Simulated network error. The order is still pending; you can retry.'}</p>}
      {phase === 'failed' && <p className="error" role="status">{es ? 'No se pudo generar el informe. Reintenta.' : 'The report could not be generated. Retry.'}</p>}
      {phase === 'processing' && <p role="status">{es ? 'Procesando pago simulado…' : 'Processing simulated payment…'}</p>}
      {phase === 'generating' && <p role="status">{es ? 'Generando tu informe…' : 'Generating your report…'}</p>}
      <div className="cta-row">
        {['summary', 'declined', 'network', 'failed'].includes(phase) && <button type="button" className="primary" onClick={confirm}>{es ? 'Confirmar pago simulado' : 'Confirm simulated payment'}</button>}
        {['summary', 'declined', 'network'].includes(phase) && <button type="button" className="ghost" onClick={() => {if (order) {try {setOrder({...getCommerce().cancel(order.id)});} catch {}} idem.current = ''; setPhase('idle');}}>{es ? 'Cancelar' : 'Cancel'}</button>}
      </div>
    </div>}
    {phase === 'ready' && report && order && <ReportView report={report} order={order} es={es}/>}
  </div>;
}

export function RecoverReport({es}: {es: boolean}) {
  const [code, setCode] = useState('');
  const [found, setFound] = useState<{order: Order; report: Report | null} | null>(null);
  const [error, setError] = useState(false);
  return <section className="card recover">
    <h2>{es ? '¿Ya tienes un informe?' : 'Already have a report?'}</h2>
    <form className="cta-row" onSubmit={e => {e.preventDefault(); try {setFound(getCommerce().recover(code)); setError(false);} catch {setFound(null); setError(true);}}}>
      <label className="grow">{es ? 'Código de recuperación' : 'Recovery code'}<input value={code} onChange={e => setCode(e.target.value)} autoComplete="off"/></label>
      <button type="submit" className="ghost">{es ? 'Recuperar' : 'Recover'}</button>
    </form>
    {error && <p className="error" role="status">{es ? 'No encontramos ese código en este navegador.' : 'Code not found in this browser.'}</p>}
    {found && (found.report?.status === 'ready' ? <ReportView report={found.report} order={found.order} es={es}/> : <p>{es ? 'Pedido encontrado; el informe aún no está listo.' : 'Order found; report not ready yet.'} ({found.order.status})</p>)}
  </section>;
}
