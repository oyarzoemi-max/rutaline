import { supabaseAdmin } from './supabase';
import { FOUNDER_LIMIT, LISTING_DURATION_DAYS } from './pricing';

// La usan tanto el webhook de Mercado Pago como el endpoint de captura de PayPal,
// así que vive acá en vez de estar pegada a un solo proveedor.
export async function confirmPendingBid(pendingBidId) {
  const { data: pending } = await supabaseAdmin
    .from('pending_bids')
    .select('*')
    .eq('id', pendingBidId)
    .single();

  if (!pending || pending.status === 'paid') return; // evita duplicados

  const { data: founders } = await supabaseAdmin
    .rpc('founder_count', { p_category: pending.category, p_destino: pending.destino });

  const isFounder = (founders ?? 0) < FOUNDER_LIMIT;
  const paidUntil = new Date(Date.now() + LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const { data: listing, error } = await supabaseAdmin
    .from('listings')
    .insert({
      category: pending.category,
      destino: pending.destino,
      name: pending.name,
      url: pending.url,
      blurb: pending.blurb,
      bid_cents: pending.bid_cents,
      founder: isFounder,
      paid_until: paidUntil.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creando el listado tras el pago:', error);
    return;
  }

  await supabaseAdmin
    .from('pending_bids')
    .update({ status: 'paid', listing_id: listing.id })
    .eq('id', pendingBidId);
}
