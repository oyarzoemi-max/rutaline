import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  const { category, destino } = req.query;
  if (!category || !destino) {
    return res.status(400).json({ error: 'Faltan category o destino' });
  }

  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('listings')
    .select('id, name, url, blurb, bid_cents, clicks, founder, logo_url')
    .eq('category', category)
    .eq('destino', destino)
    .or(`paid_until.is.null,paid_until.gte.${now}`)
    .order('bid_cents', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error consultando el ranking' });
  }

  res.status(200).json({ listings: data });
}
