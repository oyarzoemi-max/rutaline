# Rutaline — guía de puesta en marcha

Este proyecto conecta el diseño de Rutaline con pagos reales (Stripe y Mercado Pago)
y una base de datos (Supabase) que guarda los listados y ofertas.

## 1. Base de datos (Supabase)
1. Creá una cuenta gratis en supabase.com y un proyecto nuevo.
2. Andá a **SQL Editor > New query**, pegá el contenido de `sql/schema.sql` y ejecutalo.
3. En **Project Settings > API** copiá `Project URL` y `service_role key` (secreta,
   nunca la subas a un repositorio público) — van en `.env.local`.

## 2. Stripe
1. Creá una cuenta en stripe.com y completá la verificación de tu negocio
   (puede tardar 1-3 días; empezala cuanto antes).
2. En **Developers > API keys** copiá la `Secret key`.
3. Todavía no vas a poder crear el webhook hasta tener el sitio desplegado
   (necesita una URL pública) — lo hacemos en el paso 5.

## 3. Mercado Pago
1. Creá una cuenta de vendedor en mercadopago.com (o el dominio de tu país).
2. En **Tus integraciones > Credenciales de producción** copiá el `Access Token`.

## 4. Desplegar en Vercel
1. Subí esta carpeta a un repositorio de GitHub.
2. En vercel.com, **Add New Project**, importá el repositorio.
3. Antes de desplegar, cargá en **Environment Variables** todo lo que está en
   `.env.example` (con tus valores reales; `SITE_URL` completalo después del
   primer deploy, con la URL que te da Vercel).
4. Desplegá. Después conectá tu dominio comprado en **Settings > Domains**.

## 5. Activar los webhooks (con el sitio ya en línea)
- **Stripe**: Developers > Webhooks > Add endpoint →
  `https://tudominio.com/api/webhooks/stripe`, evento `checkout.session.completed`.
  Copiá el `Signing secret` que te da y cargalo como `STRIPE_WEBHOOK_SECRET` en Vercel.
- **Mercado Pago**: se configura automáticamente vía `notification_url` en el código
  (usa `SITE_URL`), no hace falta nada manual.

## Cómo funciona el flujo de pago
1. Un negocio completa el formulario de oferta en el sitio.
2. `POST /api/checkout` valida que la oferta supere a la actual, guarda una
   fila en `pending_bids`, y crea una sesión de pago en Stripe o Mercado Pago
   según lo que el negocio eligió.
3. El negocio paga en la pasarela correspondiente.
4. Stripe o Mercado Pago avisan por webhook que el pago se aprobó.
5. El webhook confirma la oferta, crea (o actualiza) el listado en `listings`,
   y le asigna insignia de Fundador si es de los primeros 10 en esa
   categoría+destino.
6. `GET /api/listings?category=...&destino=...` siempre devuelve el ranking
   real y actualizado.

## Lo que falta conectar del lado del diseño
El HTML/CSS que ya vimos (versión navy) da la interfaz visual. Falta:
- Convertir esas secciones a componentes de React en `pages/index.js` que
  llamen a `/api/listings` en vez de usar el objeto de datos de ejemplo.
- Armar el formulario de "Reclamar mi lugar" que llama a `/api/checkout`.

Si preferís, puedo armar esa parte también — es la conexión final entre el
diseño y este backend.
