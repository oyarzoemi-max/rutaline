import { supabaseAdmin } from '../../lib/supabase';

// Los links del ranking apuntan acá en vez de ir directo al sitio del negocio,
// así podemos contar el clic antes de mandar a la persona a destino.
export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send('Falta el id');

  const { data: listing, error } = await supabaseAdmin
    .from('listings')
    .select('url, clicks')
    .eq('id', id)
    .single();

  if (error || !listing) {
    return res.redirect(302, '/');
  }

  // No bloqueamos la redirección si el conteo falla; el clic ya se le
  // dio al negocio, no tiene sentido hacerlo esperar por esto.
  supabaseAdmin
    .from('listings')
    .update({ clicks: (listing.clicks || 0) + 1 })
    .eq('id', id)
    .then(() => {})
    .catch((err) => console.error('Error contando el clic:', err));

  return res.redirect(302, listing.url);
}
