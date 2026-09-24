import { supabaseAdmin } from '../../lib/supabase';

// El navegador nos manda la imagen como base64 dentro de JSON (así evitamos
// depender de una librería extra para parsear formularios multipart).
export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { fileBase64, fileName, contentType } = req.body;
    if (!fileBase64 || !fileName || !contentType) {
      return res.status(400).json({ error: 'Falta el archivo' });
    }
    if (!contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'El archivo tiene que ser una imagen' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length > 1.5 * 1024 * 1024) {
      return res.status(400).json({ error: 'La imagen no puede pesar más de 1.5 MB' });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('logos')
      .upload(path, buffer, { contentType, upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabaseAdmin.storage.from('logos').getPublicUrl(path);

    return res.status(200).json({ logoUrl: data.publicUrl });
  } catch (err) {
    console.error('Error subiendo el logo:', err);
    return res.status(500).json({ error: 'No se pudo subir el logo' });
  }
}
