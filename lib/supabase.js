import { createClient } from '@supabase/supabase-js';

// SUPABASE_SERVICE_ROLE_KEY tiene permisos totales: se usa SOLO en el servidor
// (rutas /pages/api), nunca se expone al navegador.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
