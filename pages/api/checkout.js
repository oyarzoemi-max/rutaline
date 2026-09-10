import Stripe from 'stripe';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { supabaseAdmin } from '../../lib/supabase';
import { nextMinimumBid } from '../../lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { category, destino, name, url, blurb, bidAmountUsd, provider } = req.body;

    if (!category || !destino || !name || !url || !bidAmountUsd || !provider) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    if (!['stripe', 'mercadopago'].includes(provider)) {
      return res.status(400).json({ error: 'Procesador de pago inválido' });
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
        bid_cents: bidCents, provider, status: 'pending',
      })
      .select()
      .single();

    if (pendingError) throw pendingError;

    const siteUrl = process.env.SITE_URL; // ej: https://rutaline.com

    if (provider === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            unit_amount: bidCents,
            product_data: {
              name: `Rutaline — posición en ${category} / ${destino}`,
              description: name,
            },
          },
          quantity: 1,
        }],
        metadata: { pending_bid_id: pending.id },
        success_url: `${siteUrl}/gracias?status=ok&category=${encodeURIComponent(category)}&destino=${encodeURIComponent(destino)}`,
        cancel_url: `${siteUrl}/gracias?status=cancelado`,
      });
      return res.status(200).json({ checkoutUrl: session.url });
    }

    // Mercado Pago
    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: [{
          title: `Rutaline — posición en ${category} / ${destino}`,
          description: name,
          quantity: 1,
          unit_price: bidCents / 100,
          currency_id: 'USD',
        }],
        metadata: { pending_bid_id: pending.id },
        back_urls: {
          success: `${siteUrl}/gracias?status=ok&category=${encodeURIComponent(category)}&destino=${encodeURIComponent(destino)}`,
          failure: `${siteUrl}/gracias?status=cancelado`,
          pending: `${siteUrl}/gracias?status=pendiente`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      },
    });

    return res.status(200).json({ checkoutUrl: result.init_point });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'No se pudo iniciar el pago' });
  }
}
