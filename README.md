# Rutaline — guía de puesta en marcha

Este proyecto conecta el diseño de Rutaline con pagos reales (Stripe y Mercado Pago)
y una base de datos (Supabase) que guarda los listados y ofertas.

## 1. Base de datos (Supabase)
1. Creá una cuenta gratis en supabase.com y un proyecto nuevo.
2. Andá a **SQL Editor > New query**, pegá el contenido de `sql/schema.sql` y ejecutalo.
3. En **Project Settings > API** copiá `Project URL` y `service_role key` (secreta,
   nunca la subas a un repositorio público) — van en `.env.local`.

## 2. PayPal
1. Creá una cuenta en developer.paypal.com con tu cuenta de PayPal (o creá una si no tenés).
2. Andá a **Apps & Credentials**. Por defecto vas a estar en modo "Sandbox" (pruebas) —
   ahí mismo, **Create App** te da un `Client ID` y un `Client Secret` de prueba.
3. Con esas dos claves y `PAYPAL_API_BASE=https://api-m.sandbox.paypal.com` ya podés probar
   pagos falsos de punta a punta (PayPal te deja crear cuentas de comprador/vendedor de prueba
   en **Sandbox > Accounts**).
4. Cuando quieras cobrar de verdad: arriba a la derecha cambiá de "Sandbox" a "Live", creá la
   app ahí también, y reemplazá `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` y
   `PAYPAL_API_BASE=https://api-m.paypal.com` en Vercel.

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

## 5. Webhook de Mercado Pago
Se configura automáticamente vía `notification_url` en el código (usa `SITE_URL`),
no hace falta nada manual. PayPal no necesita webhook en este proyecto: el pago se
confirma cuando el negocio vuelve de aprobarlo, en `/api/paypal-capture`.

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
