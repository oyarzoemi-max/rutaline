// Usamos la API REST de PayPal directamente por fetch, sin SDK extra.
// PAYPAL_API_BASE: https://api-m.sandbox.paypal.com (pruebas) o
// https://api-m.paypal.com (real).
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error('No se pudo autenticar con PayPal');
  const data = await res.json();
  return data.access_token;
}

// Crea la orden y devuelve el link al que hay que mandar al negocio para que pague.
export async function createPaypalOrder({ amountUsd, description, returnUrl, cancelUrl }) {
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        description,
        amount: { currency_code: 'USD', value: amountUsd.toFixed(2) },
      }],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Error creando la orden de PayPal: ${errBody}`);
  }

  const order = await res.json();
  const approveLink = order.links.find((l) => l.rel === 'approve');
  return { orderId: order.id, approveUrl: approveLink?.href };
}

// Se llama cuando el negocio vuelve de aprobar el pago en PayPal —
// recién acá se efectiviza el cobro.
export async function capturePaypalOrder(orderId) {
  const accessToken = await getAccessToken();

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  const captured = res.ok && data.status === 'COMPLETED';
  return { captured, data };
}
