import { supabaseAdmin } from '../../lib/supabase';

// Semilla para que las sugerencias no arranquen vacías el día 1.
// A medida que negocios reales pujen, sus destinos se suman a la lista.
const SEED_DESTINATIONS = [
  'Cancún, México', 'Bali, Indonesia', 'Roma, Italia', 'Santorini, Grecia',
  'Punta Cana, Rep. Dominicana', 'Barcelona, España', 'Bangkok, Tailandia',
  'París, Francia', 'Nueva York, Estados Unidos', 'Buenos Aires, Argentina',
  'Río de Janeiro, Brasil', 'Dubái, Emiratos Árabes Unidos',
];

export default async function handler(req, res) {
  const { category } = req.query;

  let query = supabaseAdmin.from('listings').select('destino');
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudieron cargar los destinos' });
  }

  const fromDb = (data || []).map((row) => row.destino).filter(Boolean);
  const merged = Array.from(new Set([...fromDb, ...SEED_DESTINATIONS]));

  res.status(200).json({ destinations: merged });
}
