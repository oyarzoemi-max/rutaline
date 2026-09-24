import { supabaseAdmin } from '../../lib/supabase';
import { nextMinimumBid } from '../../lib/pricing';
import { createPaypalOrder } from '../../lib/paypal';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { category, destino, name, url, blurb, bidAmountUsd, logoUrl } = req.body;

    if (!category || !destino || !name || !url || !bidAmountUsd) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const bidCents = Math.round(Number(bidAmountUsd) * 100);

    // Validar la oferta contra el puesto #1 actual de esa categoría+destino
    const { data: top } = await supabaseAdmin
      .from('listings')
      .select('bid_cents')
      .eq('category', category)
      .eq('destino', destino)
      .order('bid_cents', { ascending: false })
      .limit(1)
      .maybeSingle();

    const minRequired = nextMinimumBid(top?.bid_cents || 0);
    if (bidCents < minRequired) {
      return res.status(400).json({
        error: `La oferta mínima para el primer puesto es $${(minRequired / 100).toFixed(2)}`,
      });
    }

    // Registrar la oferta como pendiente hasta que se confirme el pago
    const { data: pending, error: pendingError } = await supabaseAdmin
      .from('pending_bids')
      .insert({
        category, destino, name, url, blurb: blurb || '',
        bid_cents: bidCents, provider: 'paypal', status: 'pending',
        logo_url: logoUrl || null,
      })
      .select()
      .single();

    if (pendingError) throw pendingError;

    const siteUrl = process.env.SITE_URL; // ej: https://rutaline.vercel.app

    const returnParams = new URLSearchParams({
      pending_bid_id: pending.id,
      category,
      destino,
    });
    const { approveUrl } = await createPaypalOrder({
      amountUsd: bidCents / 100,
      description: `Rutaline — ${category} / ${destino} — ${name}`,
      returnUrl: `${siteUrl}/api/paypal-capture?${returnParams.toString()}`,
      cancelUrl: `${siteUrl}/gracias?status=cancelado`,
    });

    return res.status(200).json({ checkoutUrl: approveUrl });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'No se pudo iniciar el pago' });
  }
}
