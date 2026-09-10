import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabaseAdmin } from '../../../lib/supabase';
import { FOUNDER_LIMIT, LISTING_DURATION_DAYS } from '../../../lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe necesita el cuerpo crudo (sin parsear) para verificar la firma
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await buffer(req);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Firma de Stripe inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const pendingBidId = session.metadata?.pending_bid_id;
    if (pendingBidId) {
      await confirmPendingBid(pendingBidId);
    }
  }

  res.status(200).json({ received: true });
}

// Misma lógica de confirmación que usa el webhook de Mercado Pago
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
